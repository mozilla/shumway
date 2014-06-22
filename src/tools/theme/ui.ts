/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module Shumway.Tools.Theme {

  export interface UITheme {

    // Chrome Colors
    tabToolbar              (a: number): string;
    toolbars                (a: number): string;
    selectionBackground     (a: number): string;
    selectionText           (a: number): string;
    splitters               (a: number): string;

    // Content Colors
    bodyBackground          (a: number): string;
    sidebarBackground       (a: number): string;
    attentionBackground     (a: number): string;

    // Text Colors
    bodyText                (a: number): string;
    foregroundTextGrey      (a: number): string;
    contentTextHighContrast (a: number): string;
    contentTextGrey         (a: number): string;
    contentTextDarkGrey     (a: number): string;

    // Highlight Colors
    blueHighlight           (a: number): string;
    purpleHighlight         (a: number): string;
    pinkHighlight           (a: number): string;
    redHighlight            (a: number): string;
    orangeHighlight         (a: number): string;
    lightOrangeHighlight    (a: number): string;
    greenHighlight          (a: number): string;
    blueGreyHighlight       (a: number): string;

  }

  export class UI {
    static toRGBA(r: number, g: number, b: number, a: number = 1): string {
      return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }
  }

  export class UIThemeDark implements UITheme {

    constructor() {}

    // Chrome Colors
    tabToolbar              (a: number = 1): string { return UI.toRGBA(37, 44, 51, a); }
    toolbars                (a: number = 1): string { return UI.toRGBA(52, 60, 69, a); }
    selectionBackground     (a: number = 1): string { return UI.toRGBA(29, 79, 115, a); }
    selectionText           (a: number = 1): string { return UI.toRGBA(245, 247, 250, a); }
    splitters               (a: number = 1): string { return UI.toRGBA(0, 0, 0, a); }

    // Content Colors
    bodyBackground          (a: number = 1): string { return UI.toRGBA(17, 19, 21, a); }
    sidebarBackground       (a: number = 1): string { return UI.toRGBA(24, 29, 32, a); }
    attentionBackground     (a: number = 1): string { return UI.toRGBA(161, 134, 80, a); }

    // Text Colors
    bodyText                (a: number = 1): string { return UI.toRGBA(143, 161, 178, a); }
    foregroundTextGrey      (a: number = 1): string { return UI.toRGBA(182, 186, 191, a); }
    contentTextHighContrast (a: number = 1): string { return UI.toRGBA(169, 186, 203, a); }
    contentTextGrey         (a: number = 1): string { return UI.toRGBA(143, 161, 178, a); }
    contentTextDarkGrey     (a: number = 1): string { return UI.toRGBA(95, 115, 135, a); }

    // Highlight Colors
    blueHighlight           (a: number = 1): string { return UI.toRGBA(70, 175, 227, a); }
    purpleHighlight         (a: number = 1): string { return UI.toRGBA(107, 122, 187, a); }
    pinkHighlight           (a: number = 1): string { return UI.toRGBA(223, 128, 255, a); }
    redHighlight            (a: number = 1): string { return UI.toRGBA(235, 83, 104, a); }
    orangeHighlight         (a: number = 1): string { return UI.toRGBA(217, 102, 41, a); }
    lightOrangeHighlight    (a: number = 1): string { return UI.toRGBA(217, 155, 40, a); }
    greenHighlight          (a: number = 1): string { return UI.toRGBA(112, 191, 83, a); }
    blueGreyHighlight       (a: number = 1): string { return UI.toRGBA(94, 136, 176, a); }

  }

  export class UIThemeLight implements UITheme {

    constructor() {}

    // Chrome Colors
    tabToolbar              (a: number = 1): string { return UI.toRGBA(235, 236, 237, a); }
    toolbars                (a: number = 1): string { return UI.toRGBA(240, 241, 242, a); }
    selectionBackground     (a: number = 1): string { return UI.toRGBA(76, 158, 217, a); }
    selectionText           (a: number = 1): string { return UI.toRGBA(245, 247, 250, a); }
    splitters               (a: number = 1): string { return UI.toRGBA(170, 170, 170, a); }

    // Content Colors
    bodyBackground          (a: number = 1): string { return UI.toRGBA(252, 252, 252, a); }
    sidebarBackground       (a: number = 1): string { return UI.toRGBA(247, 247, 247, a); }
    attentionBackground     (a: number = 1): string { return UI.toRGBA(161, 134, 80, a); }

    // Text Colors
    bodyText                (a: number = 1): string { return UI.toRGBA(24, 25, 26, a); }
    foregroundTextGrey      (a: number = 1): string { return UI.toRGBA(88, 89, 89, a); }
    contentTextHighContrast (a: number = 1): string { return UI.toRGBA(41, 46, 51, a); }
    contentTextGrey         (a: number = 1): string { return UI.toRGBA(143, 161, 178, a); }
    contentTextDarkGrey     (a: number = 1): string { return UI.toRGBA(102, 115, 128, a); }

    // Highlight Colors
    blueHighlight           (a: number = 1): string { return UI.toRGBA(0, 136, 204, a); }
    purpleHighlight         (a: number = 1): string { return UI.toRGBA(91, 95, 255, a); }
    pinkHighlight           (a: number = 1): string { return UI.toRGBA(184, 46, 229, a); }
    redHighlight            (a: number = 1): string { return UI.toRGBA(237, 38, 85, a); }
    orangeHighlight         (a: number = 1): string { return UI.toRGBA(241, 60, 0, a); }
    lightOrangeHighlight    (a: number = 1): string { return UI.toRGBA(217, 126, 0, a); }
    greenHighlight          (a: number = 1): string { return UI.toRGBA(44, 187, 15, a); }
    blueGreyHighlight       (a: number = 1): string { return UI.toRGBA(95, 136, 176, a); }

  }

}
