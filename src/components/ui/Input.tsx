"use client";

import { Input as AntInput } from "antd";
import type { InputRef, InputProps } from "antd";
import { forwardRef } from "react";

export const Input = forwardRef<InputRef, InputProps>(function Input(props, ref) {
  return <AntInput ref={ref} {...props} />;
});
