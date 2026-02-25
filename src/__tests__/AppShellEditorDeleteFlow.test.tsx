import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppShell from "../components/AppShell";
import * as tauriClient from "../tauriClient";

vi.mock("../tauriClient", () => ({
  getSession: vi.fn().mockResolvedValue({
    last_vault_path: "/vault",
    last_file_path: "/vault/note1.md",
  }),
  openVault: vi.fn().mockResolvedValue({
    root_path: "/vault",
    file_paths: ["/vault/note1.md", "/vault/note2.md"],
  }),
  readFile: vi.fn().mockResolvedValue("# Note 1"),
  saveSession: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  deleteFile: vi.fn().mockResolvedValue(undefined),
  listFiles: vi.fn().mockResolvedValue(["/vault/note2.md"]),
  parseFile: vi.fn().mockResolvedValue({ nodes: [] }),
  queryByTag: vi.fn(),
  searchFullText: vi.fn(),
  selectFolder: vi.fn(),
}));

describe("AppShell + Editor delete flow", () => {
  it("deletes a file and refreshes the file list", async () => {
    const user = userEvent.setup();

    const deleteFileMock = tauriClient.deleteFile as unknown as vi.Mock;
    const listFilesMock = tauriClient.listFiles as unknown as vi.Mock;

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    render(<AppShell />);

    expect(await screen.findByText("note1.md")).toBeInTheDocument();
    expect(screen.getByText("note2.md")).toBeInTheDocument();

    const deleteButton = await screen.findByText("Delete file");
    await user.click(deleteButton);

    expect(deleteFileMock).toHaveBeenCalledWith("/vault/note1.md");

    await waitFor(() => {
      expect(listFilesMock).toHaveBeenCalled();
      expect(screen.queryByText("note1.md")).not.toBeInTheDocument();
      expect(screen.getByText("note2.md")).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });
});

