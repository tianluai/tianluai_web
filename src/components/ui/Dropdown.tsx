"use client";

import { Dropdown as AntDropdown } from "antd";
import type { ComponentProps } from "react";

export function Dropdown(props: ComponentProps<typeof AntDropdown>) {
  return <AntDropdown {...props} />;
}
