import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppShell from "../components/AppShell";
import * as tauriClient from "../tauriClient";

vi.mock("../tauriClient");

vi.mock("../appState", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    initialAppState: {
      ...actual.initialAppState,
      resultsVisible: true,
      resultsTitle: "Results",
    },
  };
});

describe("AppShell tag query flow", () => {
  it("runs tag query and selects a result through SearchAndQueryPanel", async () => {
    const user = userEvent.setup();

    const mockGetSession = tauriClient.getSession as unknown as vi.Mock;
    const mockQueryByTag = tauriClient.queryByTag as unknown as vi.Mock;
    const mockReadFile = tauriClient.readFile as unknown as vi.Mock;
    const mockSaveSession = tauriClient.saveSession as unknown as vi.Mock;

    mockGetSession.mockResolvedValue({});

    const queryResults = [
      {
        file_path: "notes/decision.md",
        parent_path: "Project A > Decisions",
        node: {
          id: 1,
          depth: 0,
          text: "Decision #decision about testing",
          tags: ["decision"],
          parent_id: null,
          children_ids: [],
        },
      },
    ];

    mockQueryByTag.mockResolvedValue(queryResults);
    mockReadFile.mockResolvedValue("# Decision note content");
    mockSaveSession.mockResolvedValue(undefined);

    render(<AppShell />);

    const queryInput = await screen.findByLabelText("Tag Query:");
    await user.type(queryInput, "decision");

    await user.click(
      screen.getByRole("button", {
        name: "Query",
      })
    );

    await waitFor(() => {
      expect(mockQueryByTag).toHaveBeenCalledWith(["decision"]);
    });

    const resultItem = await screen.findByText(
      /decision\.md.*Project A > Decisions.*Decision #decision about testing/
    );

    await user.click(resultItem);

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith("notes/decision.md");
      expect(mockSaveSession).toHaveBeenCalledWith({
        last_file_path: "notes/decision.md",
      });
    });

    await waitFor(() => {
      expect(screen.queryByText("Tag Query:")).not.toBeInTheDocument();
    });

    const editorTextarea = await screen.findByDisplayValue(
      "# Decision note content"
    );
    expect(editorTextarea).toBeInTheDocument();
  });
});

