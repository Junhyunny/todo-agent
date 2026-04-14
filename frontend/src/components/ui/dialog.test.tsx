import { render, screen } from "@testing-library/react";
// biome-ignore lint/correctness/noUnusedImports: need for proper rendering
import React from "react";
import { describe, expect, test } from "vitest";
import { Dialog, DialogContent } from "./dialog";

describe("Dialog", () => {
  test("open이 true이면 DialogContent의 children이 화면에 보인다", () => {
    render(
      <Dialog open={true}>
        <DialogContent showCloseButton={false}>
          <div>다이얼로그 내용</div>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("다이얼로그 내용")).toBeInTheDocument();
  });

  test("open이 false이면 DialogContent의 children이 화면에 보이지 않는다", () => {
    render(
      <Dialog open={false}>
        <DialogContent showCloseButton={false}>
          <div>다이얼로그 내용</div>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByText("다이얼로그 내용")).not.toBeInTheDocument();
  });
});
