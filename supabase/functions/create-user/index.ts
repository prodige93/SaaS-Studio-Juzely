import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '')

    // Create a Supabase client with the Service Role key to verify admin status
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the token and get the user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      console.error('User verification error:', userError)
      throw new Error('Unauthorized: Invalid token')
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      console.error('Role verification error:', roleError)
      throw new Error('Unauthorized: Admin access required')
    }

    // Parse request body
    const { email, password, fullName, role } = await req.json()

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    // Create the new user using the admin client we already have
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName || ''
      }
    })

    if (createError) {
      throw createError
    }

    if (!newUser.user) {
      throw new Error('Failed to create user')
    }

    // Assign role to the new user
    const { error: roleAssignError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role || 'user',
        assigned_by: user.id
      })

    if (roleAssignError) {
      // If role assignment fails, we should delete the user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw new Error(`Failed to assign role: ${roleAssignError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          full_name: fullName
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
