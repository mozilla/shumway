package  {
	import flash.display.MovieClip;
	
	public class Child extends MovieClip {
		public function Child() {
			trace('construct ' + this.name + ', parent: ' + parent + ' (TODO: parent should be null at this point, and the previous ADDED not dispatched)');
		}
	}
}
