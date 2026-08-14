import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeDashboard } from "./HomeDashboard";

describe("sakin başlangıç ekranı", () => {
  it("çalışma alanı yokken başlangıç eylemini ve komut ipucunu gösterir", () => {
    render(
      <HomeDashboard
        workspaceOpen={false}
        workspaceName={null}
        onOpen={vi.fn()}
        onOpenWorkspace={vi.fn()}
        onDaily={vi.fn()}
        onNewFile={vi.fn()}
        onQuick={vi.fn()}
        onActivity={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /çalışma alanı aç/i })).toBeInTheDocument();
    expect(screen.getByText(/komut paletini açın/i)).toBeInTheDocument();
  });
});
