import json
import os
from module.shift_creator import create_shift_draft_tool, EditShiftSchedule, EditShiftEntry, eval_shift_tool, ShiftEvaluation, modify_shift_tool

# Load dummy input JSON data
def load_dummy_input_json():
    with open("/Users/takahashikaisei/mydir/shift-agent/backend/app/service/agent/data/inputs/02_sample.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return json.dumps(data, ensure_ascii=False)

# Main execution block
if __name__ == "__main__":
    print("--- Testing create_shift_draft_tool, eval_shift_tool, and modify_shift_tool with dummy data ---")

    # Set GOOGLE_API_KEY for direct execution
    if not os.getenv('GOOGLE_API_KEY'):
        print("WARNING: GOOGLE_API_KEY environment variable not set. Tools might fail if they make actual API calls.")
        print("Please set the GOOGLE_API_KEY environment variable.")
        exit(1)

    dummy_data = load_dummy_input_json()

    # --- Test create_shift_draft_tool ---
    try:
        print("\n--- Testing create_shift_draft_tool ---")
        print("Invoking create_shift_draft_tool...")
        draft_json = create_shift_draft_tool.invoke(dummy_data)
        print("create_shift_draft_tool invocation complete.")

        print("\n--- Raw Draft Output ---")
        print(draft_json)

        draft_data = json.loads(draft_json)
        full_schedule = EditShiftSchedule(**draft_data)
        print("Draft output successfully parsed and validated against EditShiftSchedule model.")
        
        print("\n--- Proposed Draft Shifts ---")
        for entry in full_schedule.edit_shift:
            print(f"  User ID: {entry.user_id}, Company ID: {entry.company_id}, Day: {entry.day}, Start: {entry.start_time}, Finish: {entry.finish_time}")

    except Exception as e:
        print(f"ERROR during create_shift_draft_tool test: {e}")
        print(f"Invalid JSON: {draft_json if 'draft_json' in locals() else 'N/A'}")
        exit(1)

    # --- Test eval_shift_tool ---
    try:
        print("\n--- Testing eval_shift_tool ---")
        print("Invoking eval_shift_tool...")
        eval_result_json = eval_shift_tool.invoke(draft_json) # Pass the draft from previous step
        print("eval_shift_tool invocation complete.")

        print("\n--- Raw Evaluation Output ---")
        print(eval_result_json)

        eval_data = json.loads(eval_result_json)
        shift_evaluation = ShiftEvaluation(**eval_data)
        print("Evaluation output successfully parsed and validated against ShiftEvaluation model.")
        
        print("\n--- Evaluation Results ---")
        print(f"  Quantitative Score: {shift_evaluation.quantitative_score}")
        print(f"  Feedback: {shift_evaluation.feedback_japanese}")

    except Exception as e:
        print(f"ERROR during eval_shift_tool test: {e}")
        print(f"Invalid JSON: {eval_result_json if 'eval_result_json' in locals() else 'N/A'}")
        exit(1)

    # --- Test modify_shift_tool ---
    try:
        print("\n--- Testing modify_shift_tool ---")
        print("Invoking modify_shift_tool...")
        modified_json = modify_shift_tool.invoke(draft_json, eval_result_json) # Pass draft and evaluation
        print("modify_shift_tool invocation complete.")

        print("\n--- Raw Modified Output ---")
        print(modified_json)

        modified_data = json.loads(modified_json)
        modified_schedule = EditShiftSchedule(**modified_data)
        print("Modified output successfully parsed and validated against EditShiftSchedule model.")
        
        print("\n--- Modified Shifts ---")
        for entry in modified_schedule.edit_shift:
            print(f"  User ID: {entry.user_id}, Company ID: {entry.company_id}, Day: {entry.day}, Start: {entry.start_time}, Finish: {entry.finish_time}")

    except Exception as e:
        print(f"ERROR during modify_shift_tool test: {e}")
        print(f"Invalid JSON: {modified_json if 'modified_json' in locals() else 'N/A'}")
        exit(1)

    print("\n--- All Tests Finished Successfully ---")