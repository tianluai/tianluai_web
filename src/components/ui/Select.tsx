"use client";

import { Select as AntSelect } from "antd";
import type { ComponentProps } from "react";

export function Select(props: ComponentProps<typeof AntSelect>) {
  return <AntSelect {...props} />;
}

Select.Option = AntSelect.Option;
