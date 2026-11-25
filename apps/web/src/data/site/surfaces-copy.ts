/** The section on the places 6pm shows up before six: Lock Screen, island, widgets, Siri, buttons. */
export interface SurfacesCopy {
  readonly mark: string;
  readonly title: string;
  readonly sub: string;
  readonly lock: {
    readonly label: string;
    readonly date: string;
    readonly left: string;
    readonly widgetTop: string;
    readonly widgetBottom: string;
    readonly activityTop: string;
    readonly activityMain: string;
    readonly activityButton: string;
    readonly notice: string;
    readonly confirm: string;
    readonly edit: string;
  };
  /** Safe to spend today, short, as the small surfaces print it. */
  readonly safe: string;
  readonly island: {
    readonly label: string;
    readonly countdown: string;
    readonly top: string;
    readonly main: string;
    readonly paid: string;
    readonly note: string;
  };
  readonly widgets: {
    readonly label: string;
    readonly closesIn: string;
    readonly caught: string;
    readonly safeToday: string;
    readonly note: string;
  };
  readonly siri: {
    readonly said: string;
    readonly logged: string;
    readonly after: string;
    readonly amount: string;
  };
  readonly action: {
    readonly label: string;
    readonly icon: string;
    readonly first: string;
    readonly second: string;
    readonly buttonLabel: string;
    readonly buttonMain: string;
    readonly note: string;
  };
}
