/** Result of reading one line as "Name : Dialogue". */
export interface ParsedDialogue {
  name: Node[];
  text: Node[];
}

/** Per-view bookkeeping while Script View is turned on. */
export interface ActiveState {
  observer: MutationObserver;
  raf: number;
}
