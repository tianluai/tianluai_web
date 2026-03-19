"use client";

import { Typography } from "antd";
import type { ComponentProps } from "react";

const { Text: AntText } = Typography;

export function Text(props: ComponentProps<typeof AntText>) {
  return <AntText {...props} />;
}
