import { readable } from 'svelte/store';
import Game from './entities/game';

export const game = readable(new Game(), (set) => {
  const newGame = new Game();
  set(newGame);
  let animFrame;
  (function updateGame(time = 0) {
    animFrame = requestAnimationFrame(updateGame);
    newGame.update(Math.floor(time * 1000));
  })();

  return () => {
    cancelAnimationFrame(animFrame);
  };
});
