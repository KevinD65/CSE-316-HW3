import React                    from 'react';
import { WButton, WRow, WCol }  from 'wt-frontend';
const SidebarHeader = (props) => {
    return (
        <WRow className='sidebar-header'>
            <WCol size="7">
                <WButton wType="texted" hoverAnimation="text-primary" className='sidebar-header-name'>
                    Todolists
                </WButton>
            </WCol>

            <WCol size="5">
                {
                    props.auth && <div className="sidebar-options">
                        {!props.disabled
                        ? <WButton className="sidebar-buttons disabled-addlist-button" shape="rounded">
                        <i className="material-icons">add</i>
                        </WButton>
                        : <WButton className="sidebar-buttons" onClick={props.createNewList} clickAnimation="ripple-light" shape="rounded" color="primary">
                            <i className="material-icons">add</i>
                        </WButton>
                        }
                    </div>
                }
            </WCol>

        </WRow>

    );
};

export default SidebarHeader;