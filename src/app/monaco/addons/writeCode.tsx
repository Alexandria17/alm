/** Imports */
import * as commands from "../../commands/commands";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as utils from "../../../common/utils";
import * as events from "../../../common/events";
import * as monacoUtils from "../monacoUtils";

/** Editor type */
type Editor = monaco.editor.ICodeEditor;
import Range = monaco.Range;
import { replaceSelection, getSelectionOrCurrentLine } from '../monacoUtils';



import CommonEditorRegistry = monaco.CommonEditorRegistry;
import ICommonCodeEditor = monaco.ICommonCodeEditor;
import TPromise = monaco.Promise;
import EditorAction = monaco.EditorAction;
import KeyMod = monaco.KeyMod;
import KeyCode = monaco.KeyCode;
import ServicesAccessor = monaco.ServicesAccessor;
import IActionOptions = monaco.IActionOptions;
import EditorContextKeys = monaco.EditorContextKeys;

class WriteCode extends EditorAction {

    constructor() {
        super({
            id: 'editor.action.writeCode',
            label: 'Write Code',
            alias: 'Write Code',
            precondition: EditorContextKeys.Focus,
            kbOpts: {
                kbExpr: EditorContextKeys.TextFocus,
                primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_X
            }
        });

    }

    public run(accessor: ServicesAccessor, editor: ICommonCodeEditor): void | TPromise<void> {
        /** Load current contents */
        const contents = getSelectionOrCurrentLine(editor);
        /** Replace with nothing */
        replaceSelection({ editor: editor, newText: '' });
        /** Send keys one by one */
        const model = editor.getModel();
        let currentPos = editor.getSelection().getStartPosition();
        (async function() {
            let i = 0;
            for (const char of contents.split('')) {
                const editOperation: monaco.editor.IIdentifiedSingleEditOperation = {
                    identifier: {
                        major: 0,
                        minor: ++i,
                    },
                    text: char,
                    range: new monaco.Range(currentPos.lineNumber, currentPos.column, currentPos.lineNumber, currentPos.column),
                    forceMoveMarkers: true,
                }

                editor.getModel().pushEditOperations([], [editOperation], null);

                /**
                 * Wait a bit and advance pos
                 */
                await utils.delay(100);
                currentPos = model.modifyPosition(currentPos, 1);
            }
        })();
    }
}

CommonEditorRegistry.registerEditorAction(new WriteCode());