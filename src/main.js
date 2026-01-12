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

import init, { tokenize } from '../wasm-pkg/tiktoken_wasm.js';

console.log('Token Visualizer starting...');

let wasmInitialized = false;

async function initWasm() {
  try {
    await init();
    wasmInitialized = true;
    console.log('WASM module loaded successfully');
  } catch (err) {
    console.error('Failed to load WASM module:', err);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function displayTokens(tokens) {
  const output = document.getElementById('output');
  const stats = document.getElementById('stats');

  if (tokens.length === 0) {
    output.innerHTML = '<p style="color: #999;">No tokens to display</p>';
    stats.textContent = '';
    return;
  }

  // Display stats
  const totalChars = tokens.reduce((sum, token) => sum + token.text.length, 0);
  stats.textContent = `Token count: ${tokens.length} | Characters: ${totalChars}`;

  // Create token display with ruby text for IDs
  const tokenElements = tokens.map((token, index) => {
    const escapedText = escapeHtml(token.text)
      .replace(/ /g, '␣')  // Visualize spaces
      .replace(/\n/g, '↵\n')  // Visualize newlines
      .replace(/\t/g, '→');  // Visualize tabs

    return `<span class="token"><ruby>${escapedText}<rt>${token.id}</rt></ruby></span>`;
  });

  output.innerHTML = tokenElements.join('');
}

initWasm();

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const button = document.getElementById('tokenize');
  const tokenizerSelect = document.getElementById('tokenizer');
  const output = document.getElementById('output');

  async function performTokenization() {
    const text = input.value;
    const selectedTokenizer = tokenizerSelect.value;

    if (!wasmInitialized) {
      output.innerHTML = '<p style="color: #999;">WASM module not yet initialized...</p>';
      return;
    }

    if (!text) {
      output.innerHTML = '<p style="color: #999;">Please enter some text to tokenize</p>';
      return;
    }

    try {
      const tokens = tokenize(text, selectedTokenizer);
      console.log('Tokenization result:', tokens);
      displayTokens(tokens);
    } catch (err) {
      console.error('Tokenization error:', err);
      output.innerHTML = `<p style="color: #dc3545;">Error: ${escapeHtml(err.toString())}</p>`;
    }
  }

  button.addEventListener('click', performTokenization);

  // Auto-tokenize on tokenizer change
  tokenizerSelect.addEventListener('change', () => {
    if (input.value) {
      performTokenization();
    }
  });

  // Auto-tokenize on load if there's default text
  if (wasmInitialized && input.value) {
    performTokenization();
  } else {
    // Wait for WASM to initialize, then tokenize
    const checkInit = setInterval(() => {
      if (wasmInitialized) {
        clearInterval(checkInit);
        if (input.value) {
          performTokenization();
        }
      }
    }, 100);
  }
});
