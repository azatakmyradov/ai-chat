<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DestroyOpenRouterKeyController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $request->user()->openrouter_api_key = null;

        $request->user()->save();

        return to_route('profile.edit');
    }
}
