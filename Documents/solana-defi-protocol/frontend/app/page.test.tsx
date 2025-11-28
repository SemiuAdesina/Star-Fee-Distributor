import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../components/WalletSection", () => ({
  WalletSection: () => <div>WalletSection</div>
}));

vi.mock("../components/SubsidyChecklist", () => ({
  SubsidyChecklist: () => <div>SubsidyChecklist</div>
}));

vi.mock("../components/MetadataCard", () => ({
  MetadataCard: () => <div>MetadataCard</div>
}));

vi.mock("../components/CiStatusBoard", () => ({
  CiStatusBoard: () => <div>CiStatusBoard</div>
}));

vi.mock("../components/GraphExplorer", () => ({
  __esModule: true,
  default: () => <div>GraphExplorer</div>
}));

vi.mock("swr", () => ({
  __esModule: true,
  default: () => ({ data: null, isLoading: false })
}));

import HomePage from "./page";

describe("HomePage", () => {
  it("renders headline", () => {
    render(<HomePage />);
    expect(screen.getByText("Audit Readiness")).toBeInTheDocument();
  });
});

