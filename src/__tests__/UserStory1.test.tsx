import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppShell from "../components/AppShell";
import * as tauriClient from "../tauriClient";

vi.mock("../tauriClient", () => ({
  openVault: vi.fn(),
  getSession: vi.fn(),
  saveSession: vi.fn(),
  listFiles: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  createFile: vi.fn(),
  deleteFile: vi.fn(),
  parseFile: vi.fn(),
  queryByTag: vi.fn(),
  searchFullText: vi.fn(),
  logFromFrontend: vi.fn(),
  selectFolder: vi.fn(),
}));

describe("User Story 1 - AppShell happy path", () => {
  it("opens a vault, selects a file, edits content, and saves", async () => {
    const user = userEvent.setup();

    (tauriClient.getSession as vi.Mock).mockResolvedValue({});
    (tauriClient.selectFolder as vi.Mock).mockResolvedValue("vault");
    (tauriClient.openVault as vi.Mock).mockResolvedValue({
      root_path: "vault",
      file_paths: ["vault/note1.md"],
    });
    (tauriClient.readFile as vi.Mock).mockResolvedValue("# Original note");
    (tauriClient.writeFile as vi.Mock).mockResolvedValue(undefined);
    (tauriClient.saveSession as vi.Mock).mockResolvedValue(undefined);
    (tauriClient.parseFile as vi.Mock).mockResolvedValue({ nodes: [] });

    render(<AppShell />);

    expect(
      screen.getByText("Select a file or open a vault to get started.")
    ).toBeInTheDocument();

    await user.click(screen.getByTitle("Open vault"));

    await waitFor(() => {
      expect(tauriClient.selectFolder).toHaveBeenCalled();
      expect(tauriClient.openVault).toHaveBeenCalledWith("vault");
      expect(screen.getByText("note1.md")).toBeInTheDocument();
    });

    await user.click(screen.getByText("note1.md"));

    await waitFor(() => {
      expect(tauriClient.readFile).toHaveBeenCalledWith("vault/note1.md");
    });

    const textarea = (await screen.findByPlaceholderText(
      "Markdown content..."
    )) as HTMLTextAreaElement;
    expect(textarea.value).toBe("# Original note");

    await user.type(textarea, " updated");

    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(tauriClient.writeFile).toHaveBeenCalledWith(
        "vault/note1.md",
        "# Original note updated"
      );
    });
  });
});
