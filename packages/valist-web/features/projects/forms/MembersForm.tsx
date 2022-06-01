import React, { useState } from 'react';
import { Button, TextInput, Textarea, Tooltip as MantineTooltip } from "@mantine/core";
import { AlertCircle as AlertCircleIcon } from 'tabler-icons-react';
import { SetUseState } from "../../../utils/Account/types";
import { UseFormReturnType } from "@mantine/form/lib/use-form";

interface MembersFormProps {
    memberText: string;
    validMemberList: boolean;
    loading: boolean;
    edit: boolean;
    setLoading: SetUseState<boolean>;
    setMemberText: SetUseState<string>;
    addMember: (address: string) => Promise<void>;
    mantineValidation:  UseFormReturnType<any>;
}


export const MembersForm = (props: MembersFormProps) => {
    const [member, setMember] = useState('');
    const rightSectionTooltip = (text: string) => {
        return (
            <MantineTooltip label={text} >
                <AlertCircleIcon size={16} style={{ display: 'block', opacity: 0.5 }} />
            </MantineTooltip>
        );
    };

    const addButton = () => {
        return (
            <Button
                color='blue'
                className='mt-2'
                type="button"
                loading={props.loading}
                loaderPosition="left"
                onClick={() => props.addMember(member)}
            >Add</Button>
        );
    };

    return (
        <form className="grid grid-cols-1 gap-y-6 sm:gap-x-8" action="#" method="POST">
            <div>
                {!props.edit && <div>
                    <Textarea
                        label="Members"
                        id="members"
                        name="members"
                        rightSection={rightSectionTooltip("A list of project members seperated by new-line.")}
                        onChange={(e) => { props.setLoading(true); props.setMemberText(e.target.value); }}
                        onBlur={(e) => props.setMemberText(e.target.value)}
                        placeholder="List of members"
                        error={props.validMemberList ? false : !props.memberText ? false : true}
                    >
                    </Textarea>
                </div>}
                {props.edit && <div>
                    <TextInput
                        id="new-member"
                        label="New Member"
                        rightSection={rightSectionTooltip("A list of project members seperated by new-line.")}
                        name="new-member"
                        type="text"
                        placeholder='Member address'
                        required
                        {...props.mantineValidation.getInputProps('newMembers')}
                    >
                    </TextInput>
                    <Button
                        color='blue'
                        className='mt-2 bg-indigo-300'
                        type="button"
                        loading={props.loading}
                        loaderPosition="left"
                        onClick={() => props.addMember(member)}
                    >Add</Button>
                </div>}
            </div>
        </form>
    );
};