/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/": {
    get: {
      responses: {
        /** OK */
        200: unknown;
      };
    };
  };
  "/profiles": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.profiles.id"];
          updated_at?: parameters["rowFilter.profiles.updated_at"];
          /** Stripe Customer ID */
          customer_id?: parameters["rowFilter.profiles.customer_id"];
          /** Stripe Subscription ID */
          subscription_id?: parameters["rowFilter.profiles.subscription_id"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["profiles"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** profiles */
          profiles?: definitions["profiles"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.profiles.id"];
          updated_at?: parameters["rowFilter.profiles.updated_at"];
          /** Stripe Customer ID */
          customer_id?: parameters["rowFilter.profiles.customer_id"];
          /** Stripe Subscription ID */
          subscription_id?: parameters["rowFilter.profiles.subscription_id"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.profiles.id"];
          updated_at?: parameters["rowFilter.profiles.updated_at"];
          /** Stripe Customer ID */
          customer_id?: parameters["rowFilter.profiles.customer_id"];
          /** Stripe Subscription ID */
          subscription_id?: parameters["rowFilter.profiles.subscription_id"];
        };
        body: {
          /** profiles */
          profiles?: definitions["profiles"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/user_charts": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.user_charts.id"];
          created_at?: parameters["rowFilter.user_charts.created_at"];
          user_id?: parameters["rowFilter.user_charts.user_id"];
          chart?: parameters["rowFilter.user_charts.chart"];
          updated_at?: parameters["rowFilter.user_charts.updated_at"];
          name?: parameters["rowFilter.user_charts.name"];
          is_public?: parameters["rowFilter.user_charts.is_public"];
          public_id?: parameters["rowFilter.user_charts.public_id"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["user_charts"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** user_charts */
          user_charts?: definitions["user_charts"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.user_charts.id"];
          created_at?: parameters["rowFilter.user_charts.created_at"];
          user_id?: parameters["rowFilter.user_charts.user_id"];
          chart?: parameters["rowFilter.user_charts.chart"];
          updated_at?: parameters["rowFilter.user_charts.updated_at"];
          name?: parameters["rowFilter.user_charts.name"];
          is_public?: parameters["rowFilter.user_charts.is_public"];
          public_id?: parameters["rowFilter.user_charts.public_id"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.user_charts.id"];
          created_at?: parameters["rowFilter.user_charts.created_at"];
          user_id?: parameters["rowFilter.user_charts.user_id"];
          chart?: parameters["rowFilter.user_charts.chart"];
          updated_at?: parameters["rowFilter.user_charts.updated_at"];
          name?: parameters["rowFilter.user_charts.name"];
          is_public?: parameters["rowFilter.user_charts.is_public"];
          public_id?: parameters["rowFilter.user_charts.public_id"];
        };
        body: {
          /** user_charts */
          user_charts?: definitions["user_charts"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
}

export interface definitions {
  profiles: {
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    id: string;
    updated_at?: string;
    /** Stripe Customer ID */
    customer_id: string;
    /** Stripe Subscription ID */
    subscription_id: string;
  };
  user_charts: {
    /**
     * Note:
     * This is a Primary Key.<pk/>
     */
    id: number;
    created_at: string;
    user_id: string;
    chart: string;
    updated_at: string;
    name: string;
    is_public: boolean;
    public_id?: string;
  };
}

export interface parameters {
  /** Preference */
  preferParams: "params=single-object";
  /** Preference */
  preferReturn: "return=representation" | "return=minimal" | "return=none";
  /** Preference */
  preferCount: "count=none";
  /** Filtering Columns */
  select: string;
  /** On Conflict */
  on_conflict: string;
  /** Ordering */
  order: string;
  /** Limiting and Pagination */
  range: string;
  /** Limiting and Pagination */
  rangeUnit: string;
  /** Limiting and Pagination */
  offset: string;
  /** Limiting and Pagination */
  limit: string;
  /** profiles */
  "body.profiles": definitions["profiles"];
  "rowFilter.profiles.id": string;
  "rowFilter.profiles.updated_at": string;
  /** Stripe Customer ID */
  "rowFilter.profiles.customer_id": string;
  /** Stripe Subscription ID */
  "rowFilter.profiles.subscription_id": string;
  /** user_charts */
  "body.user_charts": definitions["user_charts"];
  "rowFilter.user_charts.id": string;
  "rowFilter.user_charts.created_at": string;
  "rowFilter.user_charts.user_id": string;
  "rowFilter.user_charts.chart": string;
  "rowFilter.user_charts.updated_at": string;
  "rowFilter.user_charts.name": string;
  "rowFilter.user_charts.is_public": string;
  "rowFilter.user_charts.public_id": string;
}

export interface operations {}

export interface external {}
