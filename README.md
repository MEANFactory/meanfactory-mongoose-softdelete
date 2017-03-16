# mf-mongoose-softdelete
Retain historical data by flagging docs as "deleted" instead of permanently destroying them.

## Installation ##

    npm install --save mf-mongoose-softdelete

## Features ##
- Increase data integrity by retaining deleted data
- Retain historical data
- Flag objects as "deleted"
- Automatically remove deleted data from result sets
- Manually find or count data with or without deleted items


## Related Projects ##
The following projects have been designed specifically to work with each other:

### [mf-mongoose-audittrail](https://github.com/MEANFactory/mf-mongoose-audittrail) ###
Track who and when documents are created and updated without complex programming.  Compare and contract different versions of each document.

### [mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) ###
Convert to/from JSON DTO while applying optional level-based hiding.

### [mf-mongoose-softdelete](https://github.com/MEANFactory/mf-mongoose-softdelete) (this plugin) ###
Increase data integrity by retaining historical data and preventing data from being permanently deleted.  Each `delete` operation causes the document to be marked as "deleted" and subsequently hidden from result sets.

### [mf-mongoose-validate](https://github.com/MEANFactory/mf-mongoose-validate) ###
Provides additional validation for extended data types, field lengths, arrays, and other useful features.


## Contact Information ##
MEAN Factory  
[support@meanfactory.com](mailto:support@meanfactory.com)  
[www.MEANFactory.com](http://www.MEANFactory.com)  
