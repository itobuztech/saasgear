import React from 'react';
import styled from 'styled-components';
import type { ITeamMember } from "@/features/admin/team";
import { Table } from '../Common/Table';
import Button from '../Common/Button';

const ActionTd = styled.td`
  width: 20%;

  button:first-child {
    margin-right: 20px;
  }
`;

type Props = {
  teamMembers: ITeamMember[];
  handleAction?: (params: unknown) => void;
}

const ListTeamMember: React.FC<Props> = ({ teamMembers, handleAction }) => (
  <Table>
    <thead>
      <tr>
        <th>Member</th>
        <th>Role</th>
      </tr>
    </thead>
    <tbody>
      {teamMembers ? (
        teamMembers.map((it) => (
          <tr key={it.userId}>
            <td width="70%">{it.email}</td>
            <td width="10%">{it.isOwner ? 'admin' : 'member'}</td>
            {!!handleAction && (
              <ActionTd>
                <Button>Cancel</Button>
                <Button color="primary">Invitation</Button>
              </ActionTd>
            )}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={2}>No result</td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default ListTeamMember;