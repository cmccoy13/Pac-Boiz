//////////////////////////////////////////////////////////////////////////////////////
// Entry Point

window.addEventListener("load", function() {

    loadHighScores();
    initRenderer();
    atlas.create();
    initSwipe();
    gameover = false;
    newGameState.setStartLevel(1);
    switchState(newGameState);
    executive.init();
});
