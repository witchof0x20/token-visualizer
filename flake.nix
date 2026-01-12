{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
    crane.url = "github:ipetkov/crane";
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay, crane }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = (import nixpkgs) {
          inherit system;
          overlays = [ (import rust-overlay) ];
        };
        rust_toolchain =
          p: pkgs.rust-bin.stable.latest;
        craneLib = (crane.mkLib pkgs).overrideToolchain (p: (rust_toolchain p).minimal);
        nativeBuildInputs = [ pkgs.pkg-config ];
        buildInputs = [ ];
      in
      rec {
        defaultPackage = craneLib.buildPackage {
          inherit nativeBuildInputs buildInputs;
          src = ./.;
        };

        devShell = pkgs.mkShell {
          inherit buildInputs;
          nativeBuildInputs = nativeBuildInputs ++ [
            ((rust_toolchain pkgs).default.override {
              extensions = [ "rust-src" "rustfmt" "rust-analyzer" "clippy" ];
              targets = [ "wasm32-unknown-unknown" ];
            })
            pkgs.nodejs
            pkgs.wasm-pack
            pkgs.wasm-bindgen-cli
          ];
        };
      }
    );
}
