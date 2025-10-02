import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: "32px",
        }}
      >
        <div
          style={{
            fontSize: 120,
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
