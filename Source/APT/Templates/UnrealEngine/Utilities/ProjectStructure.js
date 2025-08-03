
const path = require('path');
const fs = require('fs');

AMJS.Namespace.SearchUProjectFile = function(RootDirectory)
{
    let UProjectFile = null;
    fs.readdir(
        RootDirectory, 
        (Error, Items) => 
        {  
            if (Error) 
            {
                console.error('Error reading directory:', Error);
                return;
            }

            for(let Item of Items)
            {
                const AbsoluteItem = path.join(RootDirectory, Item);
                if (path.extname(AbsoluteItem) == 'uproject')
                {
                    if (fs.statSync(AbsoluteItem).isFile())
                    {
                        UProjectFile = AbsoluteItem;
                        return;
                    }
                }
            }
        }
    );
    return UProjectFile;
}