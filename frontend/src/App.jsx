import axios from 'axios'
import React, { useEffect, useReducer, useRef, useState } from 'react'

const initialState = {
  data:[],
  loading:false,
  error:null,
  isPosting:false
}

const ACTIONS = {
  FETCH:'FETCH',
  LOADING:'LOADING',
  ERROR:'ERROR',
  ISPOSTING:'ISPOSTING',
  EDIT:'EDIT',
}

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH:
      return {...state,loading:false,data:[...state.data,...action.payload]}
    case ACTIONS.LOADING:
      return {...state,loading:true}
    case ACTIONS.LOADING:
      return {...state,error:{msg:action.payload}}
    case ACTIONS.ISPOSTING:
      return {...state,isPosting:action.payload}
    case ACTIONS.EDIT:
      return {...state,data:action.payload}

    default:
      return state
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const inputRef = useRef()
  const [isEdit , setIsEdit] = useState()

  useEffect(()=>{
    async function fetch_todos(){
      dispatch({type:ACTIONS.LOADING})
      const res = await axios('http://127.0.0.1:5000/todos')
      console.log(res.data)
      dispatch({type:ACTIONS.FETCH,payload:res.data})
    }
    fetch_todos()
  },[])


  async function handleAdd(){
    const text = inputRef.current.value
    inputRef.current.value=''
    console.log(text)
    if(!text){
      alert('reqired')
      return ;
    }
    dispatch({type:ACTIONS.ISPOSTING,payload:true})
    const res = await axios.post('http://127.0.0.1:5000/todos',{
      title:text,
      completed:false
    })
    dispatch({type:ACTIONS.ISPOSTING,payload:false})
    dispatch({type:ACTIONS.FETCH,payload:[res.data]})
  }

  async function handleEdit(completed=false,temp){

    if(completed){
      const res = await axios.put(`http://127.0.0.1:5000/todos/${temp._id}`,{
          title:temp.title,
          completed:true
        })
        const edited = state.data.map(item=>{
          if(item._id===temp._id){
            return {
              ...item,
              title:temp.title,
              completed:true
            }
          }
          return item
        })
        dispatch({type:ACTIONS.EDIT,payload:edited})
    } else {

        const text = inputRef.current.value
        console.log(text)
        if(!text){
          alert('reqired')
          return ;
        }
        const res = await axios.put(`http://127.0.0.1:5000/todos/${isEdit._id}`,{
          title:text,
          completed:isEdit.completed
        })
        inputRef.current.value=''
        const edited = state.data.map(item=>{
          if(item._id===isEdit._id){
            return {
              ...item,
              title:text,
              completed:isEdit.completed
            }
          }
          return item
        })
        dispatch({type:ACTIONS.EDIT,payload:edited})
        setIsEdit()

    }
    
  }

  function handleEditForm(todo){
    setIsEdit(todo)
    inputRef.current.value = todo.title
    console.log(todo)
  }

  async function handleDelete(todo){
    const res = await axios.delete(`http://127.0.0.1:5000/todos/${todo._id}`)

    const filtered = state.data.filter(item=>item._id!==todo._id)
    dispatch({type:ACTIONS.EDIT,payload:filtered})
  }

  function handleCross(){
    inputRef.current.value = ''
    setIsEdit()
  }
  return (
    <div className='w-screen h-[90vh]' >
      <div className="max-w-md mx-auto bg-[#E4EDF7] p-4 flex justify-center mt-8 h-full rounded-md">
        <div className="flex flex-col gap-y-4">
          <div className="flex items-center gap-x-4">
            <div className="relative ">
              <input ref={inputRef} className='bg-[#E4EDF7] h-[35px] text-[#515152] outline-none focus:border-[#c0d6f1] rounded-md border-[#d3e5fa] border-2 shadow-sm placeholder:text-[#9DAEC4] px-2' placeholder='Create your todo' type="text" />
              <span className="absolute right-2 top-[5px] cursor-pointer">
                <button onClick={handleCross} >
                  &times;
                </button>
              </span>
            </div>
            {
              isEdit ?
              <button onClick={()=>handleEdit()} className='bg-[#a9c4e2] p-1 px-2 rounded-md border-2 text-[#F1F1F2] hover:bg-[#92b2d6]' >Edit</button>
              :
              <button onClick={handleAdd} className='bg-[#a9c4e2] p-1 px-2 rounded-md border-2 text-[#F1F1F2] hover:bg-[#92b2d6]' >Add</button>
            }
          </div>
          <div className="flex flex-col gap-y-4 overflow-auto ">
            {
              state.loading ? 
              Array(5).fill(null).map((todo,i)=>(
                <p key={i} className="bg-[#D3E1F1] shadow-md p-1 px-4 text-[#3A3A3C] animate-pulse ">&nbsp;</p>
              ))
              :
              state.data.length ?
              state.data.map((todo,i)=>(
                <p key={i} className={`${todo.completed? "bg-green-200":"bg-[#D3E1F1]"} shadow-md p-1 px-4 text-[#3A3A3C] flex justify-between`}>{todo.title}
                <span className='flex gap-x-1 items-center' >
                  <button onClick={()=>handleEditForm(todo)} className='text-lg rotate-90' >&#x270E;</button>
                  <button onClick={()=>handleDelete(todo)} className='text-sm' >&#128465;</button>
                  <button onClick={()=>handleEdit(true,todo)} className='text-lg' >&#10003;</button>
                </span>
                </p>
              ))
              :
              <p className={` text-2xl mt-8 self-center shadow-md p-1 px-4 text-[#3A3A3C] flex justify-between`}>Nothing To Show !</p>
            }
            {
              state.isPosting &&
              <p className="bg-[#D3E1F1] shadow-md p-1 px-4 text-[#3A3A3C] animate-pulse ">&nbsp;</p>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default App