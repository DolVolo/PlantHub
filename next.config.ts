import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // General Image Hosts
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      // Firebase
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      // Facebook & Instagram (fbcdn)
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "scontent.**.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      // Pinterest
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "**.pinimg.com",
      },
      // TikTok
      {
        protocol: "https",
        hostname: "**.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "p16-sign-va.tiktokcdn.com",
      },
      // Imgur
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "imgur.com",
      },
      // Cloudinary
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Google Images/Drive
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      // Twitter/X
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      // Dropbox
      {
        protocol: "https",
        hostname: "**.dropbox.com",
      },
      {
        protocol: "https",
        hostname: "**.dropboxusercontent.com",
      },
      // Amazon S3
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      // Flickr
      {
        protocol: "https",
        hostname: "**.staticflickr.com",
      },
      // Media Hosts
      {
        protocol: "https",
        hostname: "**.hearstapps.com",
      },
      {
        protocol: "https",
        hostname: "hips.hearstapps.com",
      },
      // WordPress
      {
        protocol: "https",
        hostname: "**.wp.com",
      },
      // GitHub
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
      // Giphy
      {
        protocol: "https",
        hostname: "media.giphy.com",
      },
      // WeTransfer
      {
        protocol: "https",
        hostname: "**.wetransfer.com",
      },
    ],
  },
};

export default nextConfig;
