import { t, Trans } from "@lingui/macro";
import { formatDistanceStrict, parseISO } from "date-fns";
import { Check, Copy, Trash } from "phosphor-react";
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";

import { gaCreateChart, gaSponsorCTA } from "../lib/analytics";
import { LOCAL_STORAGE_SETTINGS_KEY } from "../lib/constants";
import { slugify, titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidCustomer, useIsValidSponsor } from "../lib/hooks";
import {
  deleteChart,
  makeChart,
  queryClient,
  useChart,
  useCharts,
} from "../lib/queries";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import Loading from "./Loading";
import styles from "./Navigation.module.css";
import { Button, Dialog, Input, Notice, Section, SectionTitle } from "./Shared";

const largeGap = 10;

export default function Charts() {
  const validCustomer = useIsValidCustomer();
  return (
    <Box
      px={4}
      py={8}
      gap={largeGap}
      content="start normal"
      className={styles.Navigation}
    >
      {validCustomer && <HostedCharts />}
      <LocalCharts />
    </Box>
  );
}

const localStorage = "local storage";
function LocalCharts() {
  const { setShowing } = useContext(AppContext);
  const { watch, register, handleSubmit } = useForm();
  const title = watch("chartTitle");
  const [charts, setCharts] = useState<string[]>([]);
  const { push } = useHistory();
  const { workspace = undefined } = useParams<{ workspace?: string }>();
  const { pathname } = useLocation();
  const [erase, setErase] = useState("");
  const [copy, setCopy] = useState("");
  const validCustomer = useIsValidCustomer();

  const onSubmit = useCallback(
    ({ chartTitle }: { chartTitle: string }) => {
      if (chartTitle) {
        push(`/${chartTitle}`);
        setShowing("editor");
        gaCreateChart({ action: "local" });
      }
    },
    [push, setShowing]
  );

  const handleCopy = useCallback(
    ({ chartTitle }: { chartTitle: string }) => {
      // copy in localStorage
      const data = window.localStorage.getItem(titleToLocalStorageKey(copy));
      window.localStorage.setItem(
        titleToLocalStorageKey(chartTitle),
        data ?? ""
      );
      push(`/${chartTitle}`);
      setCopy("");
      setShowing("editor");
    },
    [copy, push, setShowing]
  );

  const handleDelete = useCallback(() => {
    // if on this path, move to index
    if (workspace === erase && workspace !== "") {
      push("/");
    }
    window.localStorage.removeItem(titleToLocalStorageKey(erase));
    setErase("");
  }, [erase, push, workspace]);

  useEffect(() => {
    setCharts(
      [""]
        .concat(
          Object.keys(window.localStorage)
            .filter(
              (key) =>
                key.indexOf("flowcharts.fun:") === 0 &&
                key !== LOCAL_STORAGE_SETTINGS_KEY
            )
            .map((file) => file.split(":")[1])
        )
        .sort()
    );
  }, [erase]);

  return (
    <Section>
      <TitleAndSummary
        title={t`Local Charts`}
        summary={t`These charts are only available in this browser on this device. Clearing your browser ${localStorage} will erase these.`}
      />
      {!validCustomer && (
        <Box
          p={2}
          px={3}
          pr={4}
          rad={1}
          as="button"
          onClick={() => {
            setShowing("sponsor");
            gaSponsorCTA({ action: "from navigation" });
          }}
          className={styles.CallOut}
        >
          <Type size={-1}>
            <Trans>
              Sponsor flowchart.fun for $1 a month to access hosted flowcharts
              and the newest styles and features
            </Trans>
          </Type>
        </Box>
      )}
      <Section as="form" onSubmit={handleSubmit(onSubmit)}>
        <Box gap={2}>
          <Box template="none / 1fr auto" gap={3}>
            <Input
              placeholder={t`Enter a title`}
              {...register("chartTitle", {
                setValueAs: slugify,
              })}
            />
            <Button
              disabled={title?.length < 2 || charts.includes(title)}
              type="submit"
              text={t`Create`}
            />
          </Box>
          <Type size={-2} color="palette-white-3">
            flowchart.fun/{title}
          </Type>
        </Box>
      </Section>
      <Box gap={1} template="auto / minmax(0,1fr) repeat(2, 42px)">
        {charts
          ?.filter((c) => c !== "h")
          .map((chart) => {
            const isActive = workspace === chart || pathname === `/${chart}`;
            return (
              <Fragment key={chart}>
                <Button
                  as={Link}
                  to={`/${chart}`}
                  onClick={() => setShowing("editor")}
                  className={styles.NewChartLink}
                  content="normal start"
                  items="center stretch"
                  gap={2}
                  aria-current={isActive ? "location" : undefined}
                >
                  <Type as="span" size={-1}>
                    {`/${chart}`}
                  </Type>
                </Button>
                <Button
                  className={styles.IconButton}
                  onClick={() => setCopy(chart || "/")}
                >
                  <Copy />
                </Button>
                <Button
                  className={styles.IconButton}
                  onClick={() => setErase(chart || "/")}
                >
                  <Trash />
                </Button>
              </Fragment>
            );
          })}
      </Box>
      <DeleteChart
        erase={erase}
        setErase={setErase}
        handleDelete={handleDelete}
      />
      <CopyChart
        copy={copy}
        setCopy={setCopy}
        charts={charts}
        handleCopy={handleCopy}
      />
    </Section>
  );
}

function DeleteChart({
  erase,
  setErase,
  handleDelete,
}: {
  erase: string;
  setErase: Dispatch<SetStateAction<string>>;
  handleDelete: () => void;
}) {
  const handleDismiss = useCallback(() => {
    setErase("");
  }, [setErase]);

  return (
    <Dialog
      dialogProps={{
        isOpen: Boolean(erase),
        onDismiss: handleDismiss,
        "aria-label": t`Delete`,
      }}
      innerBoxProps={{ gap: 8 }}
    >
      <Box content="normal start" gap={2} at={{ tablet: { flow: "column" } }}>
        <Type>{erase === "/" ? t`Reset` : t`Delete`}</Type>
        <Type weight="700" self="normal center">
          flowchart.fun/{erase}
        </Type>
      </Box>
      <Box content="normal space-between" flow="column" gap={3}>
        <Button onClick={handleDismiss} text={t`Cancel`} />
        <Button
          onClick={handleDelete}
          text={erase === "/" ? t`Reset` : t`Delete`}
        />
      </Box>
    </Dialog>
  );
}

function CopyChart({
  copy,
  setCopy,
  handleCopy,
  charts,
}: {
  copy: string;
  setCopy: Dispatch<SetStateAction<string>>;
  handleCopy: (data: { chartTitle: string }) => void;
  charts: string[];
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { register, setValue, watch, handleSubmit } = useForm({
    defaultValues: { chartTitle: `${copy}-copy` },
  });
  const { ref, ...rest } = register("chartTitle", { setValueAs: slugify });

  const title = watch("chartTitle");

  const handleDismiss = useCallback(() => {
    setCopy("");
  }, [setCopy]);

  useEffect(() => {
    setValue(
      "chartTitle",
      [copy === "/" ? "" : copy, "copy"].filter(Boolean).join("-")
    );
  }, [copy, setValue]);

  return (
    <Dialog
      dialogProps={{
        isOpen: Boolean(copy),
        onDismiss: handleDismiss,
        initialFocusRef: inputRef,
        "aria-label": t`Duplicate`,
      }}
      innerBoxProps={{
        gap: 10,
        as: "form",
        onSubmit: handleSubmit(handleCopy),
      }}
    >
      <Section>
        <Type>
          <Trans>What would you like to name this copy?</Trans>
        </Type>
        <Box template="none / minmax(0, 1fr) auto" gap={3}>
          <Input
            ref={(r) => {
              inputRef.current = r;
              ref(r);
            }}
            {...rest}
            name="chartTitle"
          />
          <Button
            type="submit"
            disabled={title?.length < 2 || charts.includes(title)}
            text={t`Create`}
          />
        </Box>
      </Section>
    </Dialog>
  );
}

function HostedCharts() {
  const validSponsor = useIsValidSponsor();
  const { session, setShowing } = useContext(AppContext);
  const { push } = useHistory();
  const { id } = useParams<{ id?: string }>();
  const { mutate, isLoading } = useMutation("makeChart", makeChart, {
    onSuccess: (response: any) => {
      queryClient.invalidateQueries(["auth", "userCharts"]);
      push(`/u/${response.data[0].id}`);
      setShowing("editor");
      gaCreateChart({ action: "hosted" });
    },
  });
  const { data: charts } = useCharts();
  const { register, watch, handleSubmit } = useForm();
  const name = watch("name");
  const onSubmit = useCallback(
    ({ name }: { name: string }) => {
      session?.user?.id && mutate({ name, user_id: session?.user?.id });
    },
    [mutate, session?.user?.id]
  );
  const [copyModal, setCopyModal] = useState<false | number>(false);
  const [deleteModal, setDeleteModal] = useState<
    false | { id: number; name: string }
  >(false);
  const tooManyCharts = (charts?.length || 0) >= 16;

  return (
    <Section content="start normal">
      <TitleAndSummary
        title={t`Hosted Charts`}
        summary={t`Access these charts from anywhere. Share/embed charts that stay in sync with your edits.`}
      />
      {validSponsor ? (
        !tooManyCharts ? (
          <Section as="form" onSubmit={handleSubmit(onSubmit)}>
            <Box template="none / 1fr auto" gap={3}>
              <Input
                placeholder={t`Enter a title`}
                {...register("name", { required: true })}
                disabled={isLoading}
                isLoading={isLoading}
              />
              <Button
                disabled={!name || isLoading}
                type="submit"
                text={t`Create`}
              />
            </Box>
          </Section>
        ) : (
          <Notice>
            <span>{`16 is currently the maximum number of charts. This number will
            increase in the near future.`}</span>
          </Notice>
        )
      ) : (
        <Notice
          boxProps={{ as: "button", onClick: () => setShowing("sponsor") }}
        >
          <Trans>
            Your subscription is no longer active. If you want to create and
            edit hosted charts become a sponsor.
          </Trans>
        </Notice>
      )}
      <Box
        gap={1}
        template={
          validSponsor ? "auto / minmax(0,1fr) repeat(2, 42px)" : "auto / auto"
        }
      >
        <Box
          template="auto / minmax(0,1fr) repeat(1, 110px)"
          at={{
            tablet: { template: "auto / minmax(0,1fr) repeat(3, 110px)" },
          }}
          px={3}
          gap={2}
          className={styles.LinkColumnTitles}
        >
          <Type size={-2} as="span">
            <Trans>Name</Trans>
          </Type>
          <Box display="none" at={{ tablet: { display: "block" } }}>
            <Type size={-2}>
              <Trans>Public</Trans>
            </Type>
          </Box>
          <Type size={-2} as="span">
            <Trans>Updated</Trans>
          </Type>
          <Box display="none" at={{ tablet: { display: "block" } }}>
            <Type size={-2}>
              <Trans>Created</Trans>
            </Type>
          </Box>
        </Box>
        {validSponsor ? (
          <>
            <div />
            <div />
          </>
        ) : null}
        {charts?.map((chart) => (
          <Fragment key={chart.id}>
            <Button
              as={Link}
              to={`/u/${chart.id}`}
              onClick={() => setShowing("editor")}
              className={styles.NewChartLink}
              content="normal start"
              items="center stretch"
              template="auto / minmax(0,1fr) repeat(1, 110px)"
              at={{
                tablet: { template: "auto / minmax(0,1fr) repeat(3, 110px)" },
              }}
              gap={2}
              aria-current={
                id && parseInt(id, 10) === chart.id ? "location" : undefined
              }
              title={chart.name}
            >
              <Type as="span" size={-1}>
                {chart.name}
              </Type>
              <Box
                display="none"
                at={{ tablet: { display: "block" } }}
                self="normal end"
              >
                {chart.is_public ? <Check /> : <div />}
              </Box>
              <Type as="span" size={-1} className={styles.NewChartLinkSubtext}>
                {f(chart.updated_at)} ago
              </Type>
              <Box display="none" at={{ tablet: { display: "block" } }}>
                <Type size={-1} className={styles.NewChartLinkSubtext}>
                  {f(chart.created_at)} ago
                </Type>
              </Box>
            </Button>
            {validSponsor ? (
              <>
                <Button
                  className={styles.IconButton}
                  onClick={() => setCopyModal(chart.id)}
                  disabled={tooManyCharts}
                >
                  <Copy />
                </Button>
                <Button
                  className={styles.IconButton}
                  onClick={() =>
                    setDeleteModal({ id: chart.id, name: chart.name })
                  }
                >
                  <Trash />
                </Button>
              </>
            ) : null}
          </Fragment>
        ))}
      </Box>
      <CopyHostedChart
        isOpen={copyModal}
        onDismiss={() => setCopyModal(false)}
      />
      <DeleteHostedChart
        isOpen={deleteModal}
        onDismiss={() => setDeleteModal(false)}
      />
    </Section>
  );
}

function TitleAndSummary({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  return (
    <Box gap={2}>
      <SectionTitle>{title}</SectionTitle>
      <Box>
        <Type size={-1}>{summary}</Type>
      </Box>
    </Box>
  );
}

const f = (s: string) => formatDistanceStrict(parseISO(s), new Date());

function CopyHostedChart({
  isOpen,
  onDismiss,
}: {
  isOpen: boolean | number;
  onDismiss: () => void;
}) {
  return (
    <Dialog
      dialogProps={{
        isOpen: typeof isOpen === "number",
        onDismiss,
        "aria-label": t`Copy`,
      }}
      innerBoxProps={{}}
    >
      <Suspense fallback={<Loading />}>
        <CopyHostedChartInner isOpen={isOpen} onDismiss={onDismiss} />
      </Suspense>
    </Dialog>
  );
}

function CopyHostedChartInner({
  isOpen,
  onDismiss,
}: {
  isOpen: boolean | number;
  onDismiss: () => void;
}) {
  const { register, handleSubmit, watch } = useForm();
  const copyName = watch("name");
  const { push } = useHistory();
  const newChart = useMutation("makeChart", makeChart, {
    onSuccess: (response: any) => {
      queryClient.invalidateQueries(["auth", "userCharts"]);
      push(`/u/${response.data[0].id}`);
      onDismiss();
    },
  });
  const { data: chart } = useChart(
    typeof isOpen === "number" ? isOpen.toString() : undefined
  );
  const { session } = useContext(AppContext);
  function onSubmit({ name }: { name: string }) {
    if (chart && session?.user?.id) {
      newChart.mutate({
        name,
        user_id: session?.user.id,
        chart: chart.chart,
      });
    }
  }

  const inputRef = useRef<null | HTMLInputElement>(null);
  const { ref, ...rest } = register("name", { required: true });
  useLayoutEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  return newChart.isLoading || !chart ? (
    <Loading />
  ) : (
    <Section as="form" onSubmit={handleSubmit(onSubmit)}>
      <Type>
        <Trans>Duplicate</Trans>{" "}
        <Type color="color-highlightColor" as="span">
          {chart.name}
        </Type>
      </Type>
      <Input
        placeholder={t`Enter a title`}
        {...rest}
        ref={(el) => {
          ref(el);
          inputRef.current = el;
        }}
      />
      <Box content="normal space-between" flow="column">
        <Button onClick={onDismiss} type="button" text={t`Cancel`} />
        <Button disabled={!copyName} type="submit" text={t`Copy`} />
      </Box>
    </Section>
  );
}

function DeleteHostedChart({
  isOpen,
  onDismiss,
}: {
  isOpen: false | { id: number; name: string };
  onDismiss: () => void;
}) {
  const { handleSubmit } = useForm();
  const { push } = useHistory();
  const deleteChatMutation = useMutation("deleteChart", deleteChart, {
    onSuccess: () => {
      queryClient.invalidateQueries(["auth", "userCharts"]);
      push(`/`);
      onDismiss();
    },
  });
  function onSubmit() {
    if (isOpen !== false) {
      deleteChatMutation.mutate({
        chartId: isOpen.id,
      });
    }
  }
  return (
    <Dialog
      dialogProps={{
        isOpen: isOpen !== false,
        onDismiss,
        "aria-label": t`Copy`,
      }}
      innerBoxProps={{}}
    >
      {deleteChatMutation.isLoading ? (
        <Loading />
      ) : (
        <Section as="form" onSubmit={handleSubmit(onSubmit)}>
          <Type>
            <Trans>Do you want to delete this?</Trans>{" "}
            <Type color="color-highlightColor" as="span">
              {isOpen && isOpen.name}
            </Type>
          </Type>
          <Box content="normal space-between" flow="column">
            <Button onClick={() => onDismiss()} text={t`Cancel`} />
            <Button type="submit" text={t`Delete`} />
          </Box>
        </Section>
      )}
    </Dialog>
  );
}
