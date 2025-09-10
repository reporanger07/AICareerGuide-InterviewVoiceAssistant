import React from 'react'
import {SignIn} from '@clerk/nextjs'

const page = () => {
  return (
    
    <SignIn fallbackRedirectUrl="/dashboard" />
    
  )
}

export default page
