import React from 'react';

import { WButton, WRow, WCol } from 'wt-frontend';

const TableHeader = (props) => {

    const buttonStyle = props.disabled ? ' table-header-button-disabled ' : 'table-header-button ';
    const clickDisabled = () => { };

    
    const handleSortByTask = () => {
        props.SBC(0);
    }

    const handleSortByTaskReverse = () => {
        //props.SBC(1);
    }

    const handleSortByDueDate = () => {
       // props.SBC(2);
    }

    const handleSortByDueDateReverse = () => {
        //props.SBC(3);
    }

    const handleSortByStatus = () => {
     //   props.SBC(4);
    }

    const handleSortByStatusReverse = () => {
       // props.SBC(5);
    }
    

    return (
        <WRow className="table-header">
            <WCol size="3">
                <WButton className='table-header-section' wType="texted" onClick = {!props.isReversedTask ? handleSortByTask : handleSortByTaskReverse}>Task</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick = {!props.isReversedDD ? handleSortByDueDate : handleSortByDueDateReverse}>Due Date</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick = {!props.isReversedStatus ? handleSortByStatus : handleSortByStatusReverse}>Status</WButton>
            </WCol>
            <WCol size="2">
                <WButton className='table-header-section' wType="texted" onClick = {!props.isReversedStatus ? handleSortByStatus : handleSortByStatusReverse}>Assigned To</WButton>
            </WCol>

            <WCol size="2">
                <div className="table-header-buttons">
                    <WButton onClick={props.disabled ? clickDisabled : props.addItem} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">add_box</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : props.setShowDelete} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">delete_outline</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : () => props.setActiveList({})} wType="texted" className={`${buttonStyle}`}>
                        <i className="material-icons">close</i>
                    </WButton>
                </div>
            </WCol>

        </WRow>
    );
};

export default TableHeader;