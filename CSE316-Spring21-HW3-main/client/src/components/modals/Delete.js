import React from 'react';

import { WModal, WMHeader, WMMain, WButton } from 'wt-frontend';

const Delete = (props) => {

    // const [isVisible, setVisible] = useState(false);

    const handleDelete = async () => {
        props.deleteList(props.activeid);
        props.setShowDelete(false);
    }

    return (
        <WModal className="delete-modal" visible={props.showDelete}>
            <div className="modal-header" onClose={() => props.setShowDelete(false)}>
                Delete List?
			</div>

            <div>
                <WButton className="modal-button cancel-button" onClick={() => props.setShowDelete(false)} wType="texted">
                    Cancel
				</WButton>
                <label className="col-spacer">&nbsp;</label>
                <WButton className="modal-button" onClick={handleDelete} clickAnimation="ripple-light" hoverAnimation="darken" shape="rounded" color="danger">
                    Delete
				</WButton>
            </div>

        </WModal>
    );
}

export default Delete;