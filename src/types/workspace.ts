export type FileNodeKind = "directory" | "file";

export interface FileNode {
  name: string;
  path: string;
  kind: FileNodeKind;
  children: FileNode[];
}

export interface OpenDocument {
  path: string;
  content: string;
}
