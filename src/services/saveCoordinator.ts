import { workspaceService } from "./workspaceService";

type Writer = (path: string, content: string) => Promise<void>;

export class SaveCoordinator {
  private readonly queues = new Map<string, Promise<void>>();

  constructor(private readonly writer: Writer) {}

  enqueue(path: string, content: string): Promise<void> {
    const previous = this.queues.get(path) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(() => this.writer(path, content));
    this.queues.set(path, current);
    void current.then(
      () => {
        if (this.queues.get(path) === current) this.queues.delete(path);
      },
      () => {
        if (this.queues.get(path) === current) this.queues.delete(path);
      },
    );
    return current;
  }
}

export const saveCoordinator = new SaveCoordinator((path, content) =>
  workspaceService.writeFile(path, content),
);
