
/// <reference path='flame.ts' />
/// <reference path='../utilities.ts' />

declare var release: boolean;

interface MouseEvent extends UIEvent {
  wheelDeltaY: number;
  wheelDeltaX: number;
}
