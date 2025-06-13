<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;

function user(): ?User
{
    return Auth::user();
}
