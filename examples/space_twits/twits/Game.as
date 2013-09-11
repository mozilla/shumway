package twits {
	import flash.display.MovieClip;
	
	[native(cls="GameClass")]
	public class Game extends MovieClip {
	  public native function ctor();

		public function Game() {
			ctor();
		}

	}
	
}
