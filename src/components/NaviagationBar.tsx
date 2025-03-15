"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"
import { User } from "next-auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"



export default function NavigationBar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as User

  const Logout = async () => {

    await signOut({ redirect: false, callbackUrl: '/' })
      .then(() => {
        toast.success("User Logout Successfully")
        setTimeout(() => {
          router.push('/')
        }, 1000);
      })
      .catch((error) => {
        toast.error("Error while Logout", {
          description: error.message
        })
      })
  }


  const getUserProfile = () => {
    if (user.role === "Doctor") {
      router.replace('/doctor/profile')
    }
    else if (user.role === "Patient") {
      router.replace('/patient/profile')
    }
  }

  return (
    <nav className="p-2 w-full flex justify-between">
      <NavigationMenu className="max-w-screen justify-start">
        <NavigationMenuList>
          <NavigationMenuItem className="max-w-full">
            <Avatar className="size-16">
              <AvatarImage src="" />
              <AvatarFallback>HIH</AvatarFallback>
            </Avatar>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <NavigationMenu className="max-w-screen justify-end space-x-3">
        <NavigationMenuList className="space-x-3">
          <NavigationMenuItem >
            <Link href="/">
              Home
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem >
            <Link href="/">
              About
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem  >
            <Link href="/">
              Contact Us
            </Link>
          </NavigationMenuItem>
          {
            session?.user.role !== "Doctor" ? (
              <NavigationMenuItem  >
                <Link href="/consultancy">
                  Consult Doctor
                </Link>
              </NavigationMenuItem>
            ) :
              (<NavigationMenuList className="space-x-3">
                <NavigationMenuItem  >
                  <Link href="/consultancy/patientRequest">
                    Patient Request
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem  >
                  <Link href="/consultancy/patientList">
                    Patient List
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
              )
          }
        </NavigationMenuList>
        <NavigationMenuList>
          <NavigationMenuItem >
            <DropdownMenu >
              <DropdownMenuTrigger asChild >
                <Button variant="outline" size="icon" className="rounded-full mr-1">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
          <NavigationMenuItem >
            {session ? (
              <div className="space-x-2">
                <Button onClick={() => getUserProfile()} className="rounded-full">
                  Profile
                </Button>
                <Button onClick={() => Logout()} className="rounded-md">Logout
                  <div>
                    <LogOut />
                  </div>
                </Button>
              </div>
            ) :
              (

                <Link href="/sign-in" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} >
                    <Button>Sign In</Button>
                  </NavigationMenuLink>
                </Link>
              )}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav >

  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
