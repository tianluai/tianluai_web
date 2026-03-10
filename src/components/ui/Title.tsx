"use client";

import { Typography } from "antd";
import type { ComponentProps } from "react";

const { Title: AntTitle } = Typography;

export function Title(props: ComponentProps<typeof AntTitle>) {
  return <AntTitle {...props} />;
}
