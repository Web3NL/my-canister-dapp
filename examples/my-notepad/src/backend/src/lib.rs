//! My Notepad - Personal Notes Dapp
//!
//! A CRUD-style User-Owned Dapp demonstrating on-chain note storage using:
//! - `my_canister_frontend` for certified asset serving
//! - `my_canister_dashboard` for management UI and endpoints

use std::cell::RefCell;

use candid::CandidType;
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_http_certification::{HttpRequest, HttpResponse};
use include_dir::{include_dir, Dir};
use my_canister_dashboard::{
    guards::{only_canister_controllers_guard, only_ii_principal_guard},
    setup::setup_dashboard_assets,
    ManageAlternativeOriginsArg, ManageAlternativeOriginsResult, ManageIIPrincipalArg,
    ManageIIPrincipalResult, ManageTopUpRuleArg, ManageTopUpRuleResult, WasmStatus,
};
use my_canister_frontend::{asset_router::with_asset_router_mut, setup_frontend};
use serde::{Deserialize, Serialize};

/// Embedded frontend assets from the build output.
static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../frontend/dist");

/// Alternative origins allowed for Internet Identity derivation.
const ALTERNATIVE_ORIGINS: &[&str] = &["http://localhost:5174"];

/// Valid note color values.
const VALID_COLORS: &[&str] = &["default", "red", "blue", "green", "yellow", "purple"];

// ============================================================================
// Data Types
// ============================================================================

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct Note {
    id: u32,
    title: String,
    content: String,
    created_at: u64,
    updated_at: u64,
    color: String,
    pinned: bool,
}

#[derive(CandidType, Deserialize)]
struct AddNoteArg {
    title: String,
    content: String,
    color: Option<String>,
}

#[derive(CandidType, Deserialize)]
enum AddNoteResult {
    Ok(Note),
    Err(String),
}

#[derive(CandidType, Deserialize)]
struct UpdateNoteArg {
    id: u32,
    title: Option<String>,
    content: Option<String>,
    color: Option<String>,
    pinned: Option<bool>,
}

#[derive(CandidType, Deserialize)]
enum UpdateNoteResult {
    Ok(Note),
    Err(String),
}

#[derive(CandidType, Deserialize)]
enum DeleteNoteResult {
    Ok,
    Err(String),
}

#[derive(CandidType, Serialize, Deserialize)]
struct StableState {
    notes: Vec<Note>,
    next_id: u32,
}

// ============================================================================
// State
// ============================================================================

thread_local! {
    static NOTES: RefCell<Vec<Note>> = const { RefCell::new(Vec::new()) };
    static NEXT_ID: RefCell<u32> = const { RefCell::new(0) };
}

// ============================================================================
// Initialization
// ============================================================================

fn setup_assets() {
    setup_frontend(&FRONTEND_DIR).expect("Failed to setup frontend");

    with_asset_router_mut(|router| {
        let origins: Vec<String> = ALTERNATIVE_ORIGINS.iter().map(|s| s.to_string()).collect();
        setup_dashboard_assets(router, Some(origins)).expect("Failed to setup dashboard assets");
    });
}

#[init]
fn init() {
    setup_assets();
}

// ============================================================================
// Stable Memory Persistence
// ============================================================================

#[pre_upgrade]
fn pre_upgrade() {
    let state = StableState {
        notes: NOTES.with(|n| n.borrow().clone()),
        next_id: NEXT_ID.with(|id| *id.borrow()),
    };
    let bytes = candid::encode_one(&state).expect("Failed to encode state");
    let total_len = 4 + bytes.len();
    let pages_needed = (total_len as u64).div_ceil(65536);
    let current_pages = ic_cdk::stable::stable_size();
    if pages_needed > current_pages {
        ic_cdk::stable::stable_grow(pages_needed - current_pages)
            .expect("Failed to grow stable memory");
    }
    ic_cdk::stable::stable_write(0, &(bytes.len() as u32).to_le_bytes());
    ic_cdk::stable::stable_write(4, &bytes);
}

#[post_upgrade]
fn post_upgrade() {
    let mut len_bytes = [0u8; 4];
    ic_cdk::stable::stable_read(0, &mut len_bytes);
    let len = u32::from_le_bytes(len_bytes) as usize;

    if len > 0 {
        let mut bytes = vec![0u8; len];
        ic_cdk::stable::stable_read(4, &mut bytes);
        if let Ok(state) = candid::decode_one::<StableState>(&bytes) {
            NOTES.with(|n| *n.borrow_mut() = state.notes);
            NEXT_ID.with(|id| *id.borrow_mut() = state.next_id);
        }
    }

    setup_assets();
}

// ============================================================================
// HTTP Asset Serving
// ============================================================================

#[query]
fn http_request(request: HttpRequest) -> HttpResponse {
    my_canister_frontend::http_request(request)
}

// ============================================================================
// WASM Metadata
// ============================================================================

#[query]
fn wasm_status() -> WasmStatus {
    WasmStatus {
        name: "My Notepad".to_string(),
        version: 1,
        memo: Some("Personal notes on the Internet Computer".to_string()),
    }
}

// ============================================================================
// Dashboard Management Endpoints
// ============================================================================

#[update(guard = "only_canister_controllers_guard")]
fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
    my_canister_dashboard::manage_ii_principal(arg)
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_alternative_origins(arg: ManageAlternativeOriginsArg) -> ManageAlternativeOriginsResult {
    with_asset_router_mut(|router| my_canister_dashboard::manage_alternative_origins(router, arg))
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult {
    my_canister_dashboard::manage_top_up_rule(arg)
}

// ============================================================================
// Helpers
// ============================================================================

fn validate_color(color: &str) -> Result<(), String> {
    if VALID_COLORS.contains(&color) {
        Ok(())
    } else {
        Err(format!(
            "Invalid color '{}'. Must be one of: {}",
            color,
            VALID_COLORS.join(", ")
        ))
    }
}

fn now_seconds() -> u64 {
    ic_cdk::api::time() / 1_000_000_000
}

// ============================================================================
// Notepad Endpoints
// ============================================================================

/// Return all notes for the authenticated owner.
#[query(guard = "only_ii_principal_guard")]
fn get_notes() -> Vec<Note> {
    NOTES.with(|notes| notes.borrow().clone())
}

/// Add a new note. Returns the created note.
#[update(guard = "only_ii_principal_guard")]
fn add_note(arg: AddNoteArg) -> AddNoteResult {
    let title = arg.title.trim().to_string();
    if title.is_empty() {
        return AddNoteResult::Err("Title cannot be empty".to_string());
    }

    let color = arg.color.unwrap_or_else(|| "default".to_string());
    if let Err(e) = validate_color(&color) {
        return AddNoteResult::Err(e);
    }

    let id = NEXT_ID.with(|next| {
        let id = *next.borrow();
        *next.borrow_mut() = id + 1;
        id
    });

    let ts = now_seconds();
    let note = Note {
        id,
        title,
        content: arg.content,
        created_at: ts,
        updated_at: ts,
        color,
        pinned: false,
    };

    NOTES.with(|notes| notes.borrow_mut().push(note.clone()));

    AddNoteResult::Ok(note)
}

/// Update an existing note. Supports partial updates.
#[update(guard = "only_ii_principal_guard")]
fn update_note(arg: UpdateNoteArg) -> UpdateNoteResult {
    NOTES.with(|notes| {
        let mut notes = notes.borrow_mut();
        let Some(note) = notes.iter_mut().find(|n| n.id == arg.id) else {
            return UpdateNoteResult::Err(format!("Note with id {} not found", arg.id));
        };

        if let Some(title) = arg.title {
            let title = title.trim().to_string();
            if title.is_empty() {
                return UpdateNoteResult::Err("Title cannot be empty".to_string());
            }
            note.title = title;
        }

        if let Some(content) = arg.content {
            note.content = content;
        }

        if let Some(color) = arg.color {
            if let Err(e) = validate_color(&color) {
                return UpdateNoteResult::Err(e);
            }
            note.color = color;
        }

        if let Some(pinned) = arg.pinned {
            note.pinned = pinned;
        }

        note.updated_at = now_seconds();

        UpdateNoteResult::Ok(note.clone())
    })
}

/// Delete a note by ID.
#[update(guard = "only_ii_principal_guard")]
fn delete_note(id: u32) -> DeleteNoteResult {
    NOTES.with(|notes| {
        let mut notes = notes.borrow_mut();
        let len_before = notes.len();
        notes.retain(|n| n.id != id);
        if notes.len() == len_before {
            DeleteNoteResult::Err(format!("Note with id {id} not found"))
        } else {
            DeleteNoteResult::Ok
        }
    })
}
