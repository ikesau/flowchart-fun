import strip from "@tone-row/strip-comments";
import cytoscape, { CytoscapeOptions } from "cytoscape";

export function stripComments(t: string) {
  return strip(t, { preserveNewlines: true });
}

export function parseText(
  text: string,
  getSize: (
    label: string,
    minWidth?: number,
    minHeight?: number
  ) =>
    | {
        width: number;
        height: number;
      }
    | undefined,
  startingLineNumber = 0
) {
  const ids: string[] = [];
  const elements: CytoscapeOptions["elements"] = [];
  let lineNumber = 1;

  // break into lines
  const lines = text.split("\n");
  const lineData: ReturnType<typeof getLineData>[] = [];

  // Loop over lines
  for (const lineStr of lines) {
    lineData[lineNumber] = getLineData(lineStr, lineNumber);
    const line = lineData[lineNumber];
    if (line) {
      const { linkedId, nodeLabel, edgeLabel, indent, id, classes } = line;
      if (ids.includes(id)) throw new Error(`Duplicate ID: ${id}`);
      ids.push(id);

      if (indent) {
        let parent, lineNumberToCheck;

        for (
          lineNumberToCheck = lineNumber - 1;
          lineNumberToCheck >= 1;
          lineNumberToCheck--
        ) {
          const lineToCheck = lineData[lineNumberToCheck];
          if (!lineToCheck) continue;

          if (lineToCheck.indent.length < indent.length) {
            parent = lineData[lineNumberToCheck];
            break;
          }
        }

        // If we found a parent
        if (parent) {
          const source = parent.id;
          const target = linkedId || line.id;

          // Find a unique id
          let id = `${source}_${target}:0`;
          while (elements.map(({ data: { id } }) => id).includes(id)) {
            let [, count] = id.split(":");
            count = (parseInt(count, 10) + 1).toString();
            id = `${source}_${target}:${count}`;
          }
          elements.push({
            data: {
              id,
              source,
              target,
              label: edgeLabel,
              lineNumber: lineNumber + startingLineNumber,
            },
          });
        }
      } else {
        // No indent
        if (edgeLabel) {
          throw new Error(
            `Line ${
              lineNumber + startingLineNumber
            } has an edge label but no indent.`
          );
        }
      }
      if (!linkedId) {
        // Check for custom id
        elements.push({
          classes,
          data: {
            id,
            label: nodeLabel,
            lineNumber: lineNumber + startingLineNumber,
            ...getSize(nodeLabel),
          },
        });
      }
    }
    lineNumber++;
  }

  // Before returning elements, check if user
  // used label text as pointer, and replace with id
  const labelToId = elements.reduce<Record<string, string>>(
    (acc, el) =>
      isEdge(el)
        ? acc
        : {
            ...acc,
            [el.data.label]: el.data.id,
          },
    {}
  );

  // Reassign label, line number targets to IDs
  for (const element of elements) {
    const target = element.data.target;
    // If element is an edge,
    if (!target) continue;

    // and the target is not an id
    if (Object.values(labelToId).includes(target)) continue;

    // replace target with id if it's a label
    if (target in labelToId) {
      element.data.target = labelToId[element.data.target];
      continue;
    }

    // or if it's a valid line number
    if (!isNaN(target)) {
      const lineNumber = parseInt(target, 10);
      const targetElement = elements.find(
        ({ data: { lineNumber: elLineNumber } }) => elLineNumber === lineNumber
      );
      if (targetElement) {
        element.data.target = targetElement.data.id;
      }
    }
  }

  return elements;
}

function getLineData(text: string, lineNumber: number) {
  if (text.trim() === "") return;
  // Whole line description in one regex with named capture groups
  // 1) Indent ^(?<indent>\s*) -- store the indent which is 0 or more whitespace at the start
  // 2) ID (\[(?<id>.*)\])? -- store the ID if it exists after the indent in square brackets
  // 3) Edge Label ((?<edgeLabel>.+): )? -- store the edge label if it exists
  // 4) Node Label (?<nodeLabel>.+?) -- store the node label
  const lineRegex =
    /^(?<indent>\s*)(\[(?<id>[^.]*)?(?<classes>(\.[_a-zA-Z]*[_a-zA-Z0-9-]*)*?)\])?((?<edgeLabel>.+)[:：] *)?(?<nodeLabel>.+?)?$/;
  // /^(?<indent>\s*)(\[(?<id>.*)\])?((?<edgeLabel>.+)[:：] *)?(?<nodeLabel>.+?)$/;
  const { groups } = text.match(lineRegex) || {};
  const {
    nodeLabel = "",
    edgeLabel = "",
    indent,
    id = betterDefaultId(lineNumber),
    classes,
  } = groups || {};
  const { groups: labelGroups } =
    nodeLabel.match(/^[(（](?<linkedId>.+)[)）]\s*$/) || {};
  const { linkedId } = labelGroups || {};
  return {
    nodeLabel: decodeURIComponent(nodeLabel.trim()),
    edgeLabel: decodeURIComponent(edgeLabel.trim()),
    indent,
    id,
    classes: classes ? classes.slice(1).replace(/\./gi, " ") : "",
    linkedId:
      typeof linkedId !== "undefined" ? decodeURIComponent(linkedId) : linkedId,
  };
}

function isEdge(el: cytoscape.ElementDefinition) {
  return "target" in el.data || "source" in el.data;
}

function betterDefaultId(lineNumber: number) {
  return `N${(333 + lineNumber).toString(16)}`;
}
