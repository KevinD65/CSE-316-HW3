import React, { useState, useEffect } 	from 'react';
import Logo 							from '../navbar/Logo';
import NavbarOptions 					from '../navbar/NavbarOptions';
import MainContents 					from '../main/MainContents';
import SidebarContents 					from '../sidebar/SidebarContents';
import Login 							from '../modals/Login';
import Delete 							from '../modals/Delete';
import CreateAccount 					from '../modals/CreateAccount';
import { GET_DB_TODOS } 				from '../../cache/queries';
import * as mutations 					from '../../cache/mutations';
import { useMutation, useQuery } 		from '@apollo/client';
import { WNavbar, WSidebar, WNavItem } 	from 'wt-frontend';
import { WLayout, WLHeader, WLMain, WLSide } from 'wt-frontend';
import { UpdateListField_Transaction, 
	UpdateListItems_Transaction, 
	ReorderItems_Transaction, 
	EditItem_Transaction, 
	SortListByCol_Transaction} 				from '../../utils/jsTPS';
import WInput from 'wt-frontend/build/components/winput/WInput';


const Homescreen = (props) => {

	let todolists 							= [];
	const [activeList, setActiveList] 		= useState({});
	const [showDelete, toggleShowDelete] 	= useState(false);
	const [showLogin, toggleShowLogin] 		= useState(false);
	const [showCreate, toggleShowCreate] 	= useState(false);
	const [isReversedTask, toggleReverseTask] = useState(false); //boolean value indicates how next click will cause items to be sorted
	const [isReversedDD, toggleReverseDD] = useState(false); //boolean value indicates how next click will cause items to be sorted
	const [isReversedStatus, toggleReverseStatus] = useState(false); //boolean value indicates how next click will cause items to be sorted
	const [isReversedAssignedTo, toggleReverseAssignedTo] = useState(false); //boolean value indicates how next click will cause items to be sorted

	const [ReorderTodoItems] 		= useMutation(mutations.REORDER_ITEMS);
	const [UpdateTodoItemField] 	= useMutation(mutations.UPDATE_ITEM_FIELD);
	const [UpdateTodolistField] 	= useMutation(mutations.UPDATE_TODOLIST_FIELD);
	const [DeleteTodolist] 			= useMutation(mutations.DELETE_TODOLIST);
	const [DeleteTodoItem] 			= useMutation(mutations.DELETE_ITEM);
	const [AddTodolist] 			= useMutation(mutations.ADD_TODOLIST);
	const [AddTodoItem] 			= useMutation(mutations.ADD_ITEM);

	const [SortItemsByCol]      	= useMutation(mutations.SORT_ITEMS_BY_COL);
	const [UnsortItems]           	= useMutation(mutations.UNSORT_ITEMS);
	const [UpdatePosition]			= useMutation(mutations.UPDATE_POSITION);


	const { loading, error, data, refetch } = useQuery(GET_DB_TODOS);
	if(loading) { console.log(loading, 'loading'); }
	if(error) { console.log(error, 'error'); }
	if(data) { data.getAllTodos.map(todo => todolists.push(todo)); 
		let temp;
		for(let i = 0; i < todolists.length - 1; i++){
			for(let j = i + 1; j < todolists.length; j++){
				if(todolists[j].position < todolists[i].position){
					temp = todolists[i];
					todolists[i] = todolists[j];
					todolists[j] = temp;
				}
			}
		}}

	const auth = props.user === null ? false : true;

	const refetchTodos = async (refetch) => {
		const { loading, error, data } = await refetch();
		if (data) {
			todolists = [];
			data.getAllTodos.map(todo => todolists.push(todo));
			//console.log(todolists[0].name + "hello" + todolists[1].name + "hello" + todolists[2].name + "hello");
 
			let temp;
			for(let i = 0; i < todolists.length - 1; i++){
				for(let j = i + 1; j < todolists.length; j++){
					if(todolists[j].position < todolists[i].position){
						temp = todolists[i];
						todolists[i] = todolists[j];
						todolists[j] = temp;
					}
				}
			}

			//console.log(todolists[0].name + "hello" + todolists[1].name + "hello" + todolists[2].name + "hello");
			
			console.log(todolists);
			for(let a = 0; a < todolists.length; a++){
				console.log(todolists[a].position);
			}

			if (activeList._id) {
				let tempID = activeList._id;
				let list = todolists.find(list => list._id === tempID);
				setActiveList(list);
			}
		}
	}

	const tpsUndo = async () => {
		const retVal = await props.tps.undoTransaction();
		refetchTodos(refetch);
		return retVal;
	}

	const tpsRedo = async () => {
		const retVal = await props.tps.doTransaction();
		refetchTodos(refetch);
		return retVal;
	}

	const tpsHasUndo = () => {
		const retVal = props.tps.hasTransactionToUndo();
		//refetchTodos(refetch);
		return retVal;
	}

	const tpsHasRedo = () => {
		const retVal = props.tps.hasTransactionToRedo();
		//refetchTodos(refetch);
		return retVal;
	}


	// Creates a default item and passes it to the backend resolver.
	// The return id is assigned to the item, and the item is appended
	//  to the local cache copy of the active todolist. 
	const addItem = async () => {
		resetAllSortToggles();
		let list = activeList;
		const items = list.items;
		const lastID = items.length >= 1 ? items.length /*items[items.length - 1].id + 1*/ : 0;
		const newItem = {
			_id: '',
			id: lastID,
			description: 'No Description',
			due_date: 'No Date',
			assigned_to: 'Kevin', //props.user._id,
			completed: false
		};
		let opcode = 1;
		let itemID = newItem._id;
		let listID = activeList._id;
		let transaction = new UpdateListItems_Transaction(listID, itemID, newItem, opcode, AddTodoItem, DeleteTodoItem);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};


	const deleteItem = async (item, index) => {
		resetAllSortToggles();
		let listID = activeList._id;
		let itemID = item._id;
		let opcode = 0;
		let itemToDelete = {
			_id: item._id,
			id: item.id,
			description: item.description,
			due_date: item.due_date,
			assigned_to: item.assigned_to,
			completed: item.completed
		}
		let transaction = new UpdateListItems_Transaction(listID, itemID, itemToDelete, opcode, AddTodoItem, DeleteTodoItem, index);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};

	const editItem = async (itemID, field, value, prev) => {
		let flag = 0;
		if (field === 'completed') flag = 1;
		let listID = activeList._id;
		let transaction = new EditItem_Transaction(listID, itemID, field, prev, value, flag, UpdateTodoItemField);
		props.tps.addTransaction(transaction);
		tpsRedo();
		resetAllSortToggles();
	};

	const reorderItem = async (itemID, dir) => {
		let listID = activeList._id;
		let transaction = new ReorderItems_Transaction(listID, itemID, dir, ReorderTodoItems);
		props.tps.addTransaction(transaction);
		tpsRedo();
		resetAllSortToggles();
	};

	const createNewList = async () => { //fix
		props.tps.clearAllTransactions();
		const length = todolists.length
		const id = length >= 1 ? todolists[length - 1].id + Math.floor((Math.random() * 100) + 1) : 1;
		const lastPosition = todolists.length >= 1 ? todolists.length : 0;
		let list = {
			_id: '',
			id: id,
			name: 'Untitled',
			owner: props.user._id,
			items: [],
			position: lastPosition
		}
		const { data } = await AddTodolist({ variables: { todolist: list }, refetchQueries: [{ query: GET_DB_TODOS }] });
		// const myID = todolists.find(todo => todo.position === lastPosition);
		// console.log(id + "  " + myID);
		//handleSetActive(myID._id);
		//handleSetActive(data["addTodolist"]);
		await refetchTodos(refetch);
		let v = todolists.find(todo => todo._id === data["addTodolist"]);
		handleSetActive(v._id);
		/*
		setTimeout(() => {
			let v = todolists.find(todo => todo._id === data["addTodolist"]);
			handleSetActive(v._id);
			//setActiveList(v);
			refetchTodos(refetch);
		}, 50);
		//let v = todolists.find(todo => todo._id === data["addTodolist"]);
		//setActiveList(v);
		refetchTodos(refetch);
		//console.log(activeList._id + "hi");*/
	};

	const deleteList = async (_id) => {
		resetAllSortToggles();
		const todo = todolists.find(todo => todo._id === _id);
		console.log(todo.position);
		for(let i = todo.position; i < todolists.length - 1; i++){
			let nextListInOrder = todolists.find(list => list.position === i + 1);
			UpdatePosition({ variables: {_id: nextListInOrder._id, newPosition: i }}); //every list after the deleted one gets its position lowered by 1
		}
		DeleteTodolist({ variables: { _id: _id }, refetchQueries: [{ query: GET_DB_TODOS }] });
		refetch();
		setActiveList({});
		props.tps.clearAllTransactions();
	};

	const updateListField = async (_id, field, value, prev) => {
		resetAllSortToggles();
		let transaction = new UpdateListField_Transaction(_id, field, prev, value, UpdateTodolistField);
		props.tps.addTransaction(transaction);
		tpsRedo();

	};

	const handleSetActive = async (id) => {
		/*
		console.log(id + "HI");
		const todo = todolists.find(todo => todo.id === id || todo._id === id);
		console.log(todo);
		*/
		//if(activeList.id !== id){
			props.tps.clearAllTransactions();
			const todo = todolists.find(todo => todo.id === id || todo._id === id);
			console.log(todo.position + "hello");
			for(let i = 0; i < todo.position; i++){
				console.log("SHIFT");
				let nextListInOrder = await todolists.find(list => list.position === i);
				console.log(nextListInOrder.name);
				//console.log(todolists.find(list => list.position === i) + "hi");
				await UpdatePosition({ variables: {_id: nextListInOrder._id, newPosition: i + 1 }}); //every successive list position gets moved down one
			}
			await UpdatePosition({ variables: {_id: todo._id, newPosition: 0}}); //set the newly selected list's position to 0
			/*
			let myList = [];
			for(let i = 0; i < todolists.length; i++){
				myList.push(todolists.find(list => list.position === i));
				
			}
			todolists = myList;
			*/
			await refetchTodos(refetch);
			setActiveList(todo);
			//refetchTodos(refetch);
			resetAllSortToggles();
		//}
	};

	const resetAllSortToggles = () => {
		toggleReverseTask(false);
		toggleReverseDD(false);
		toggleReverseStatus(false);
		toggleReverseAssignedTo(false);
	}

	const sortByColumn = async (filterNumber) => {
		if(activeList._id === undefined)
			return
		let listID = activeList._id;
		let items = activeList.items;
		let filNum = filterNumber;
		console.log(filNum);
		if(filterNumber === 0){
			toggleReverseTask(true);
			toggleReverseDD(false);
			toggleReverseStatus(false);
			toggleReverseAssignedTo(false);
		}
		else if(filterNumber === 1){
			toggleReverseTask(false);
			toggleReverseDD(false);
			toggleReverseStatus(false);
			toggleReverseAssignedTo(false);
		}
		else if(filterNumber === 2){
			toggleReverseDD(true);
			toggleReverseTask(false);
			toggleReverseStatus(false);
			toggleReverseAssignedTo(false);
		}
		else if(filterNumber === 3){
			toggleReverseDD(false);
			toggleReverseTask(false);
			toggleReverseStatus(false);
			toggleReverseAssignedTo(false);
		}
		else if(filterNumber === 4){
			toggleReverseStatus(true);
			toggleReverseTask(false);
			toggleReverseDD(false);
			toggleReverseAssignedTo(false);
		}
		else if(filterNumber === 5){
			toggleReverseStatus(false);
			toggleReverseTask(false);
			toggleReverseDD(false);
			toggleReverseAssignedTo(false);
		}
		else if(filterNumber === 6){
			toggleReverseAssignedTo(true);
			toggleReverseTask(false);
			toggleReverseDD(false);
			toggleReverseStatus(false);
		}
		else if(filterNumber === 7){
			toggleReverseAssignedTo(false);
			toggleReverseTask(false);
			toggleReverseDD(false);
			toggleReverseStatus(false);
		}
		let transaction = new SortListByCol_Transaction(listID, items, SortItemsByCol, UnsortItems, parseInt(filNum));
		props.tps.addTransaction(transaction);
		tpsRedo();
	}

	const clearTransactions = () => {
		props.tps.clearAllTransactions();
	}

	const controlZcontrolY = (event) => {
		console.log(props.tps.hasTransactionToUndo());
		if(event.ctrlKey && event.keyCode === 90 && props.tps.hasTransactionToUndo()){
			tpsUndo();
		}
		else if(event.ctrlKey && event.keyCode === 89 && props.tps.hasTransactionToRedo()){
			tpsRedo();
		}
	}
	
	/*
		Since we only have 3 modals, this sort of hardcoding isnt an issue, if there
		were more it would probably make sense to make a general modal component, and
		a modal manager that handles which to show.
	*/
	const setShowLogin = () => {
		toggleShowDelete(false);
		toggleShowCreate(false);
		toggleShowLogin(!showLogin);
	};

	const setShowCreate = () => {
		toggleShowDelete(false);
		toggleShowLogin(false);
		toggleShowCreate(!showCreate);
	};

	const setShowDelete = () => {
		toggleShowCreate(false);
		toggleShowLogin(false);
		toggleShowDelete(!showDelete)
	}

	return (
		<WLayout wLayout="header-lside" onKeyDown = {controlZcontrolY} tabIndex = {0}>
			<WLHeader>
				<WNavbar color="colored">
					<ul>
						<WNavItem>
							<Logo className='logo' />
						</WNavItem>
					</ul>
					<ul>
						<NavbarOptions
							fetchUser={props.fetchUser} auth={auth} 
							setShowCreate={setShowCreate} setShowLogin={setShowLogin}
							refetchTodos={refetch} setActiveList={setActiveList}
						/>
					</ul>
				</WNavbar>
			</WLHeader>

			<WLSide side="left">
				<WSidebar>
					{
						activeList ?
							<SidebarContents
								todolists={todolists} activeid={activeList.id} auth={auth}
								handleSetActive={handleSetActive} createNewList={createNewList}
								updateListField={updateListField}
								activeList={activeList}
							/>
							:
							<></>
					}
				</WSidebar>
			</WLSide>
			<WLMain>
				{
					activeList ? 
							<div className="container-secondary">
								<MainContents
									addItem={addItem} deleteItem={deleteItem}
									editItem={editItem} reorderItem={reorderItem}
									setShowDelete={setShowDelete}
									activeList={activeList} setActiveList={setActiveList}
									sortByColumn={sortByColumn}
									isReversedTask={isReversedTask}
									isReversedDD={isReversedDD}
									isReversedStatus={isReversedStatus}
									isReversedAssignedTo={isReversedAssignedTo}
									tpsUndo={tpsUndo} tpsRedo={tpsRedo}
									hasUndo={tpsHasUndo} hasRedo={tpsHasRedo}
									auth={auth}
									clearTransactions={clearTransactions}
								/>
							</div>
						:
							<div className="container-secondary" />
				}

			</WLMain>

			{
				showDelete && (<Delete deleteList={deleteList} activeid={activeList._id} setShowDelete={setShowDelete} showDelete={showDelete}/>)
			}

			{
				showCreate && (<CreateAccount fetchUser={props.fetchUser} setShowCreate={setShowCreate} showCreate={showCreate}/>)
			}

			{
				showLogin && (<Login fetchUser={props.fetchUser} refetchTodos={refetch}setShowLogin={setShowLogin} showLogin={showLogin}/>)
			}

		</WLayout>
	);
};

export default Homescreen;