// Copyright (C) 2026 Jade Harley
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use tiktoken_rs::CoreBPE;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Serialize, Deserialize)]
pub struct TokenInfo {
    pub text: String,
    pub id: usize,
}

#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
    log("WASM module initialized!");
}

fn get_bpe(tokenizer: &str) -> Result<CoreBPE, String> {
    match tokenizer {
        "o200k_harmony" => tiktoken_rs::o200k_harmony(),
        "o200k_base" => tiktoken_rs::o200k_base(),
        "cl100k_base" => tiktoken_rs::cl100k_base(),
        "p50k_base" => tiktoken_rs::p50k_base(),
        "p50k_edit" => tiktoken_rs::p50k_edit(),
        "r50k_base" | "gpt2" => tiktoken_rs::r50k_base(),
        _ => return Err(format!("Unknown tokenizer: {}", tokenizer)),
    }
    .map_err(|e| format!("Failed to load tokenizer: {}", e))
}

#[wasm_bindgen]
pub fn tokenize(text: &str, tokenizer: &str) -> Result<JsValue, JsValue> {
    let bpe = get_bpe(tokenizer)
        .map_err(|e| JsValue::from_str(&e))?;

    let tokens = bpe.encode_ordinary(text);
    let mut result = Vec::new();

    for token in tokens {
        // Decode each token to get its text representation
        let token_text = bpe.decode(vec![token])
            .map_err(|e| JsValue::from_str(&format!("Failed to decode token: {}", e)))?;

        result.push(TokenInfo {
            text: token_text,
            id: token as usize,
        });
    }

    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

#[wasm_bindgen]
pub fn get_available_tokenizers() -> Vec<JsValue> {
    vec![
        JsValue::from_str("o200k_harmony"),
        JsValue::from_str("o200k_base"),
        JsValue::from_str("cl100k_base"),
        JsValue::from_str("p50k_base"),
        JsValue::from_str("p50k_edit"),
        JsValue::from_str("r50k_base"),
    ]
}
