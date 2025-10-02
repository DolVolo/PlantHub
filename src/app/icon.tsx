import { ImageResponse } from "next/og";

export const size = {
  width: 256,
  height: 256,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 30% 30%, #bbf7d0, #047857)",
          borderRadius: "48px",
        }}
      >
        <div
          style={{
            fontSize: 160,
          }}
        >
          🌱
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
