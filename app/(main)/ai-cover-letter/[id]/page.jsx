import React from 'react'

const CoverLetter =async ({params}) => {
    const id=await params.id;
    console.log(id);
  return (
    <div className='flex justify-center items-center h-screen'>
      CoverLetter:{id}
    </div>
  )
}

export default CoverLetter
