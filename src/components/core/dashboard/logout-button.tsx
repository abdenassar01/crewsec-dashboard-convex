'use client'

import { Button } from '@/components/ui'
import { authClient } from '@/lib/auth-client'
import { Logout01FreeIcons } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import React from 'react'

export  function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start mt-2"
      onClick={() => authClient.signOut()}
      // onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <HugeiconsIcon icon={Logout01FreeIcons} className="mr-2 h-4 w-4" /> Logout
    </Button>
  )
}