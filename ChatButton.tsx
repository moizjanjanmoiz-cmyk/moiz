'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { marketplaceFetch,marketplaceEnabled } from '@/lib/marketplace/browser';
export function ChatButton({shopId}:{shopId:string}){const router=useRouter();const [busy,setBusy]=useState(false),[error,setError]=useState('');return <div><button disabled={busy||!marketplaceEnabled} onClick={async()=>{setBusy(true);setError('');try{const r=await marketplaceFetch('/api/marketplace/chat',{method:'POST',body:JSON.stringify({shopId})});router.push(`/messages?thread=${r.threadId}`);}catch(e){setError(e instanceof Error?e.message:'Sign in to chat.');}finally{setBusy(false);}}} className="bg-blue-600 text-white font-bold rounded-xl px-5 py-3 text-sm disabled:opacity-50">{busy?'Opening…':'Chat with seller'}</button>{error&&<p role="status" className="text-sm text-amber-800 mt-3">{error} <a href="/seller/auth" className="underline">Sign in</a></p>}</div>}
