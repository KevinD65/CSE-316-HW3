import React            from 'react';
import TableHeader      from './TableHeader';
import TableContents    from './TableContents';

const MainContents = (props) => {
    return (
        <div className='table ' >
            <TableHeader
                disabled={!props.activeList._id} addItem={props.addItem}
                setShowDelete={props.setShowDelete} setActiveList={props.setActiveList}
                
                SBC={props.sortByColumn} 
                isReversedTask={props.isReversedTask}
                isReversedDD={props.isReversedDD}
                isReversedStatus={props.isReversedStatus}
                isReversedAssignedTo={props.isReversedAssignedTo}

                undo={props.tpsUndo} redo={props.tpsRedo}
                updateListField={props.updateListField}
                hasUndo={props.hasUndo} hasRedo={props.hasRedo}
                auth={props.auth}
            />
            <TableContents
                key={props.activeList.id} activeList={props.activeList}
                deleteItem={props.deleteItem} reorderItem={props.reorderItem}
                editItem={props.editItem}
            />
        </div>
    );
};

export default MainContents;