
APT.Common.BroadcastSimpleEvent = function(Event)
{
    for (let Listener of Event)
    {
        APT.Common.Assert(Listener, "Invalid listener");
        Listener();
    }
}