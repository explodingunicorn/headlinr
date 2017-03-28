exports.Round = function() {
    var round = 1;
    var likesReq = 25 + (round+1 * (round-1));
    var commentsReq = 10 + (round * (round-1));
    var usersReq = 3 + (round * (round-2));

    this.generateRound = function() {
        var reqs = {};
        reqs.likes = likesReq;
        reqs.comments = commentsReq;
        reqs.users = usersReq;
        
        round++;
        generateNewReqs();

        return(reqs);
    }
    
    function generateNewReqs() {
        likesReq = 25 + ((round+1) * (round));
        commentsReq = 20 + (round * (round-1));
        usersReq = 2 + round;
    }
}