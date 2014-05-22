
/// <reference path='../../utilities.ts' />
/// <reference path='timelineFrame.ts' />
/// <reference path='timelineBuffer.ts' />
/// <reference path='flameChart.ts' />

declare var release: boolean;

interface MouseEvent extends UIEvent {
  wheelDeltaY: number;
  wheelDeltaX: number;
}
