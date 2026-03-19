"use client";

import { Space as AntSpace } from "antd";
import type { ComponentProps } from "react";

export function Space(props: ComponentProps<typeof AntSpace>) {
  return <AntSpace {...props} />;
}
