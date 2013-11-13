/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Random collection of Hacks to get demos work, this file should be empty.
 */

VM_METHOD_OVERRIDES["static mochi.as3.MochiServices::connect"] = function () {
  return;
};

VM_METHOD_OVERRIDES["static MochiBot::track"] = function () {
  return;
};

VM_METHOD_OVERRIDES["com.midasplayer.debug.DebugLog::trace"] = function (msg) {
  console.log(msg);
};

VM_METHOD_OVERRIDES["com.midasplayer.engine.comm.DebugGameComm::getGameData"] =
  function () {
  return '<gamedata randomseed="554884453" version="1">\n<musicOn>true</musicOn>\n<soundOn>true</soundOn>\n<isShortGame>false</isShortGame>\n<booster_1>0</booster_1>\n<booster_2>0</booster_2>\n<booster_3>0</booster_3>\n<booster_4>0</booster_4>\n<booster_5>0</booster_5>\n<bestScore>0</bestScore>\n<bestChain>0</bestChain>\n<bestLevel>0</bestLevel>\n<bestCrushed>0</bestCrushed>\n<bestMixed>0</bestMixed>\n<text id="outro.crushed">Candy crushed</text>\n<text id="outro.bestever">best ever</text>\n<text id="outro.trophy.two">scored {0} in one game</text>\n<text id="outro.combo_color_color">All Clear Created</text>\n<text id="outro.trophy.one">crushed {0} candy in one game</text>\n<text id="outro.score">Score</text>\n<text id="outro.opengame">Please register to play the full game</text>\n<text id="outro.chain">Longest chain</text>\n<text id="outro.time">Game ends in {0} seconds</text>\n<text id="outro.combo_color_line">Super Stripes Created</text>\n<text id="game.nomoves">No more moves!</text>\n<text id="outro.combo_wrapper_line">Mega-Candy Created</text>\n<text id="intro.time">Game starts in {0} seconds</text>\n<text id="outro.now">now</text>\n<text id="outro.level">Level reached</text>\n<text id="outro.title">Game Over</text>\n<text id="intro.info1">Match 3 Candy of the same colour to crush them. Matching 4 or 5 in different formations generates special sweets that are extra tasty.</text>\n<text id="intro.info2">You can also combine the special sweets for additional effects by switching them with each other. Try these combinations for a taste you will not forget: </text>\n<text id="outro.combo_color_wrapper">Double Colour Bombs Created</text>\n<text id="outro.trophy.three">made {0} combined candy in one game</text>\n<text id="intro.title">Play like this:</text>\n</gamedata>';
};

VM_METHOD_OVERRIDES["com.antkarlov.Preloader::com.antkarlov:Preloader.isUrl"] = function () {
  return true;
};
